import re
import asyncio
from typing import Dict, Any

from base import OpenFactCheck

def extract_text(claim):
    """
    Extracts text from a claim that might be a string formatted as a dictionary.
    """
    # Try to extract text using regular expression if claim is a string formatted as a dictionary
    match = re.search(r"'text': '([^']+)'", claim)
    if match:
        return match.group(1)
    return claim  # Return as is if no dictionary format detected

# Add this function to support the FastAPI app

async def evaluate_response_async(
    ofc: OpenFactCheck, 
    input_text: Dict[str, str],
    claimprocessor: str = None,
    retriever: str = None,
    verifier: str = None
) -> Dict[str, Any]:
    """
    Async version of evaluate_response_api for FastAPI
    """
    # Run the synchronous function in a thread pool
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor() as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, 
            lambda: evaluate_response_api(
                ofc, 
                input_text, 
                claimprocessor=claimprocessor,
                retriever=retriever,
                verifier=verifier
            )
        )
    
    # Ensure overall_factuality is a string
    if result["overall_factuality"] is None:
        result["overall_factuality"] = "unknown"
        
    return result

def evaluate_response_api(
    ofc: OpenFactCheck, 
    input_text: Dict[str, str],
    claimprocessor: str = None,
    retriever: str = None,
    verifier: str = None
) -> Dict[str, Any]:
    """
    This function evaluates the factuality of text and returns structured data.
    
    Args:
        ofc: OpenFactCheck instance
        input_text: Dictionary with 'text' key containing the response to evaluate
        claimprocessor: Name of the claim processor to use (optional)
        retriever: Name of the retriever to use (optional)
        verifier: Name of the verifier to use (optional)
        
    Returns:
        Dict containing evaluation results
    """
    # Initialize response evaluator
    response_evaluator = ofc.ResponseEvaluator
    
    # If components are not specified, use the first available ones
    if not claimprocessor:
        claimprocessor = ofc.list_claimprocessors()[0]
    if not retriever:
        retriever = ofc.list_retrievers()[0]
    if not verifier:
        verifier = ofc.list_verifiers()[0]
    
    # Configure the pipeline with selected components
    ofc.init_pipeline_manually([claimprocessor, retriever, verifier])
    
    # Process the evaluation
    response_stream = response_evaluator.evaluate_streaming(input_text)
    
    # Process and collect all the response data
    result = {
        "pipeline": [claimprocessor, retriever, verifier],
        "detected_claims": [],
        "evidence_count": 0,
        "supported_claims": 0,
        "conflicted_claims": 0,
        "controversial_claims": 0,
        "unverified_claims": 0,
        "overall_factuality": None,
        "overall_credibility": 0.0,
        "detailed_claims": []
    }
    
    # Process each stage of the pipeline
    for response in response_stream:
        if "claimprocessor" in response["solver_name"]:
            output_text = response["output"]
            detected_claims = output_text.get("claims", [])
            result["detected_claims"] = [extract_text(claim) for claim in detected_claims]
            
        elif "retriever" in response["solver_name"]:
            output_text = response["output"]
            
            questions = []
            evidences = []
            for _, claim_with_evidences in output_text.get("claims_with_evidences", {}).items():
                for claim_with_evidence in claim_with_evidences:
                    questions.append(claim_with_evidence[0])
                    evidences.append(claim_with_evidence[1])
            
            result["evidence_count"] = len(evidences)
            
        elif "verifier" in response["solver_name"]:
            output_text = response["output"]
            details = output_text.get("detail", None)
            
            if details is not None:
                # Process each claim detail
                claims = 0
                false_claims = 0
                true_claims = 0
                controversial_claims = 0
                unverified_claims = 0
                detailed_claims = []
                
                for i, detail in enumerate(details):
                    factuality = str(detail.get("factuality", None))
                    claim = detail.get("claim", "")
                    claim_text = extract_text(claim)
                    
                    claim_data = {
                        "id": i + 1,
                        "claim": claim_text,
                        "factuality_status": None,
                        "error": detail.get("error", None) if detail.get("error", None) != "None" else None,
                        "reasoning": detail.get("reasoning", None) if detail.get("reasoning", None) != "None" else None,
                        "correction": detail.get("correction", None) if detail.get("correction", "") != "" else None,
                        "evidences": []
                    }
                    
                    # Process evidences
                    if detail.get("evidences", None) != "":
                        questions_evidences = {}
                        for evidence in detail.get("evidences", []):
                            question = evidence[0]
                            evidence_data = evidence[1]
                            
                            # Initialize if this question isn't in the dict yet
                            if question not in questions_evidences:
                                questions_evidences[question] = []
                            
                            # Check if evidence_data is a dict with content/source or just a string
                            if isinstance(evidence_data, dict) and "content" in evidence_data and "source" in evidence_data:
                                # Add structured evidence with text and URL
                                questions_evidences[question].append({
                                    "text": evidence_data["content"],
                                    "url": evidence_data["source"]
                                })
                            elif isinstance(evidence_data, str):
                                # If it's just a string (content only), add it without URL
                                questions_evidences[question].append({
                                    "text": evidence_data,
                                    "url": "None"
                                })
                            else:
                                # For any other format, try to add whatever data we have
                                try:
                                    text = str(evidence_data) if evidence_data else "No content"
                                    questions_evidences[question].append({
                                        "text": text,
                                        "url": "None"
                                    })
                                except:
                                    # Fallback for any problematic evidence
                                    questions_evidences[question].append({
                                        "text": "Error processing evidence",
                                        "url": "None"
                                    })
                        
                        # Add processed evidences to claim data
                        for question, question_evidences in questions_evidences.items():
                            claim_data["evidences"].append({
                                "question": question,
                                "sources": question_evidences
                            })
                    
                    # Determine factuality status
                    if factuality is not None:
                        claims += 1
                        if factuality == "-1" or factuality == "False":
                            claim_data["factuality_status"] = "false"
                            false_claims += 1
                        elif factuality == "1" or factuality == "True":
                            claim_data["factuality_status"] = "true" 
                            true_claims += 1
                        elif factuality == "0":
                            claim_data["factuality_status"] = "controversial"
                            controversial_claims += 1
                        else:
                            claim_data["factuality_status"] = "unverified"
                            unverified_claims += 1
                    
                    detailed_claims.append(claim_data)
                
                # Update result with aggregated metrics
                result["supported_claims"] = true_claims
                result["conflicted_claims"] = false_claims
                result["controversial_claims"] = controversial_claims
                result["unverified_claims"] = unverified_claims
                result["detailed_claims"] = detailed_claims
                
                # Set overall factuality
                overall_factuality = output_text.get("label", "Unknown")
                result["overall_factuality"] = "true" if overall_factuality else "false"
                
                # Calculate and set overall credibility
                overall_credibility = true_claims / claims if claims > 0 else 0
                result["overall_credibility"] = overall_credibility
    
    return result