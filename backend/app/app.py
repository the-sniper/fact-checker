import os
import sys
import traceback
import argparse
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Add the parent directory to sys.path to properly import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openfactcheck import OpenFactCheck
from lib.config import OpenFactCheckConfig
from .evaluate_response import evaluate_response_async


# Load environment variables from .env file
load_dotenv()

# Request and response models
class ResponseEvaluationRequest(BaseModel):
    text: str
    claimprocessor: Optional[str] = "factool_claimprocessor"
    retriever: Optional[str] = "factool_retriever"
    verifier: Optional[str] = "factool_verifier"

class EvidenceSource(BaseModel):
    question: str
    sources: List[str]

class ClaimDetail(BaseModel):
    id: int
    claim: str
    factuality_status: str
    error: Optional[str] = None
    reasoning: Optional[str] = None
    correction: Optional[str] = None
    evidences: List[EvidenceSource] = []

class ResponseEvaluationResult(BaseModel):
    pipeline: List[str]
    detected_claims: List[str]
    evidence_count: int
    supported_claims: int
    conflicted_claims: int
    controversial_claims: int
    unverified_claims: int
    overall_factuality: str
    overall_credibility: float
    detailed_claims: List[ClaimDetail]

def create_app() -> FastAPI:
    """
    Factory function to create the FastAPI app.
    It uses on_startup event to initialize OpenFactCheck.
    """
    
    app = FastAPI(
        title="FactCheck API",
        description="An API for factuality evaluation.",
        version="1.0.0"
    )

    # Enable CORS for frontend clients
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.on_event("startup")
    async def startup_event():
        config_path = os.environ.get("CONFIG_PATH", "config.json")
        
        required_keys = ["OPENAI_API_KEY", "SERPER_API_KEY", "SCRAPER_API_KEY"]
        missing_keys = [key for key in required_keys if not os.getenv(key)]
        if missing_keys:
            raise EnvironmentError(f"Required API keys ({', '.join(missing_keys)}) not found.")
        
        config = OpenFactCheckConfig(config_path)
        app.state.ofc = OpenFactCheck(config)

    @app.post("/evaluate-response", response_model=ResponseEvaluationResult)
    async def evaluate_response(request: ResponseEvaluationRequest, req: Request):
        try:
            input_text = {"text": request.text}
            ofc = req.app.state.ofc
            result = await evaluate_response_async(
                ofc,
                input_text,
                claimprocessor=request.claimprocessor,
                retriever=request.retriever,
                verifier=request.verifier,
            )
            return result
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error details: {error_details}")
            raise HTTPException(status_code=500, detail=f"Error evaluating response: {str(e)}")

    @app.get("/available-components")
    async def get_components(req: Request):
        try:
            ofc = req.app.state.ofc
            components = {
                "claimprocessors": ofc.list_claimprocessors(),
                "retrievers": ofc.list_retrievers(),
                "verifiers": ofc.list_verifiers(),
            }
            return components
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error getting components: {str(e)}")

    return app

if __name__ == "__main__":
    def parse_args():
        parser = argparse.ArgumentParser(description="FastAPI application for OpenFactCheck.")
        parser.add_argument("--config-path", type=str, default="config.json", help="Config file path")
        parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
        parser.add_argument("--env-file", type=str, default=".env", help="Path to .env file")
        parser.add_argument("--debug", action="store_true", help="Run in debug mode with hot reload")
        return parser.parse_args()

    args = parse_args()
    
    os.environ["CONFIG_PATH"] = args.config_path
    os.environ["ENV_FILE"] = args.env_file

    uvicorn.run(
        "app.app:create_app",
        host="0.0.0.0",
        port=args.port,
        reload=args.debug
    )