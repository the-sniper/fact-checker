import os
import sys
import argparse
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Add the parent directory to sys.path to properly import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openfactcheck import OpenFactCheck
from lib.config import OpenFactCheckConfig


# Load environment variables from .env file
load_dotenv()

# Define request and response models
class ResponseEvaluationRequest(BaseModel):
    text: str
    claimprocessor: Optional[str] = None
    retriever: Optional[str] = None
    verifier: Optional[str] = None

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

def parse_args():
    parser = argparse.ArgumentParser(description='Initialize OpenFactCheck with custom configuration.')
    
    # Add arguments here, example:
    parser.add_argument("--config-path", 
                        type=str, 
                        help="Config File Path",
                        default="config.json")
    parser.add_argument("--port",
                        type=int,
                        help="Port to run the server on",
                        default=8000)
    parser.add_argument("--env-file",
                        type=str,
                        help="Path to .env file",
                        default=".env")
    
    # Parse arguments from command line
    args = parser.parse_args()
    return args

def get_ofc(config_path: str = "config.json"):
    # Check if the API keys are set in the environment variables
    required_keys = ["OPENAI_API_KEY", "SERPER_API_KEY", "SCRAPER_API_KEY"]
    missing_keys = [key for key in required_keys if not os.getenv(key)]
    
    if missing_keys:
        raise EnvironmentError(f"Required API keys ({', '.join(missing_keys)}) not found in environment or .env file")
    
    # Initialize OpenFactCheck
    config = OpenFactCheckConfig(config_path)
    return OpenFactCheck(config)

class App:
    def __init__(self, config_path: str = "config.json", env_file: str = ".env"):
        # Try to load environment variables from the specified .env file
        if os.path.exists(env_file):
            load_dotenv(env_file)
            print(f"Loaded environment variables from {env_file}")
        else:
            print(f"Warning: Environment file {env_file} not found. Using system environment variables.")
            
        # Initialize FastAPI app
        self.app = FastAPI(
            title="OpenFactCheck API",
            description="An API for factuality evaluation of LLM responses",
            version="1.0.0"
        )
        self.config_path = config_path
        
        # Register routes
        self.register_routes()
    
    def register_routes(self):
        @self.app.post("/evaluate-response", response_model=ResponseEvaluationResult)
        async def evaluate_response(request: ResponseEvaluationRequest, ofc: OpenFactCheck = Depends(lambda: get_ofc(self.config_path))):
            try:
                # Prepare the input text format expected by the evaluator
                input_text = {"text": request.text}
                
                # Call the async evaluate_response function
                from evaluate_response import evaluate_response_async
                result = await evaluate_response_async(
                    ofc, 
                    input_text, 
                    claimprocessor=request.claimprocessor,
                    retriever=request.retriever,
                    verifier=request.verifier
                )
                
                return result
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                print(f"Error details: {error_details}")
                raise HTTPException(status_code=500, detail=f"Error evaluating response: {str(e)}")
        
        @self.app.get("/available-components")
        async def get_components(ofc: OpenFactCheck = Depends(lambda: get_ofc(self.config_path))):
            """Get available claimprocessors, retrievers and verifiers"""
            try:
                return {
                    "claimprocessors": ofc.list_claimprocessors(),
                    "retrievers": ofc.list_retrievers(),
                    "verifiers": ofc.list_verifiers()
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error getting components: {str(e)}")

if __name__ == "__main__":
    args = parse_args()
    
    try:
        app = App(args.config_path, args.env_file)
        # For running with uvicorn directly from this file
        uvicorn.run(app.app, host="0.0.0.0", port=args.port)
    except EnvironmentError as e:
        print(f"Error: {e}")