"use client";
import CustomInput from "@/components/atoms/inputs/CustomInput";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { capitalize } from "@mui/material";
import { useState, useRef } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const EvaluationSchema = Yup.object().shape({
  text: Yup.string()
    .required("Text to evaluate is required")
    .min(3, "Text must be at least 3 characters")
    .max(1000, "Text must be less than 1000 characters"),
});

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meaningLessInput, setMeaningLessInput] = useState(false);
  const formikRef = useRef(null); // Add useRef to store Formik instance

  const evaluateText = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/evaluate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          claimprocessor: "factool_claimprocessor",
          retriever: "factool_retriever",
          verifier: "factool_verifier",
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      console.log(data, "checkData");
      if (
        data.conflicted_claims === 0 &&
        data.controversial_claims === 0 &&
        data.evidence_count === 0 &&
        data.overall_credibility === 0 &&
        data.supported_claims === 0 &&
        data.unverified_claims === 0 &&
        (!data.detailed_claims || data.detailed_claims.length === 0) &&
        (!data.detected_claims || data.detected_claims.length === 0) &&
        data.overall_factuality === "true"
      ) {
        setMeaningLessInput(true);
      } else {
        setMeaningLessInput(false);
      }
    } catch (err) {
      setError(err.message || "Failed to evaluate text");
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home customContainer">
      <div className="factCheckerMain">
        <div className="factCheckerForm">
          <h1 className="text-lg">Fact Checker</h1>
          <Formik
            innerRef={formikRef} // Attach Formik instance to the ref
            initialValues={{ text: "" }}
            validationSchema={EvaluationSchema}
            onSubmit={evaluateText}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <Field name="text">
                  {({ field }) => (
                    <div>
                      <CustomInput
                        {...field}
                        placeholder="Enter text to evaluate"
                        disabled={loading}
                        endAdornment={
                          <CustomButton
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            label={loading ? "Evaluating..." : "Evaluate"}
                          />
                        }
                      />
                      {errors.text && touched.text ? (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.text}
                        </div>
                      ) : null}
                    </div>
                  )}
                </Field>
              </Form>
            )}
          </Formik>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>
        {loading ? (
          <div className="claimsInfoCnt">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`claimsInfo skeleton-loader skeleton-bg-${
                  index + 1
                }`}
              >
                <h4 className="skeleton-text"></h4>
                <p className="skeleton-text-sm"></p>
              </div>
            ))}
          </div>
        ) : result && !meaningLessInput ? (
          <div className="claimsInfoCnt">
            <div className="claimsInfo">
              <h4>{result.detected_claims?.length}</h4>
              <p>Detected Claims</p>
            </div>
            <div className="claimsInfo">
              <h4>{result.evidence_count}</h4>
              <p>Retrieved Evidences</p>
            </div>
            <div className="claimsInfo">
              <h4>{result.supported_claims}</h4>
              <p>Supported Claims</p>
            </div>
            <div className="claimsInfo">
              <h4>{result.conflicted_claims}</h4>
              <p>Conflicted Claims</p>
            </div>
            <div className="claimsInfo">
              <h4>{result.controversial_claims}</h4>
              <p>Controversial Claims</p>
            </div>
            <div className="claimsInfo">
              <h4>{result.unverified_claims}</h4>
              <p>Unverified Claims</p>
            </div>
          </div>
        ) : (formikRef.current?.values?.text != undefined && error == "") && (
          <div className="meaningLessInput">
            <h4>Oops! We couldn't understand that sentence or determine if it was a fact.</h4>
            <h4>Please try with another query.</h4>
          </div>
        )}
      </div>
      {loading ? (
        <div className="factCheckerDescription skeleton-section">
          {/* Overall Scores Skeleton */}
          <div className="overallScores">
            <div className="overallFactCheck skeleton-loader">
              <div>
                <h6 className="skeleton-text-sm"></h6>
                <h3 className="skeleton-text"></h3>
              </div>
              <div className="skeleton-icon"></div>
            </div>
            <div className="overallFactCheck skeleton-loader">
              <div>
                <h6 className="skeleton-text-sm"></h6>
                <h3 className="skeleton-text"></h3>
              </div>
              <div className="skeleton-icon"></div>
            </div>
          </div>

          {/* Detected Claims Skeleton */}
          <h3 className="skeleton-text-md"></h3>
          <ol className="skeleton-list">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="skeleton-text-sm"></li>
            ))}
          </ol>

          {/* Fact Details Skeleton */}
          <h3 className="skeleton-text-md"></h3>
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className={`factCheckerInfo skeleton-loader ${
                index === 0 ? "first" : ""
              }`}
            >
              <div className="factClaim skeleton-loader">
                <h4 className="skeleton-text"></h4>
              </div>

              <div className="fcInner">
                <h5 className="skeleton-text-sm"></h5>
                <p className="skeleton-text-paragraph"></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        result &&
        !meaningLessInput && (
          <div className="factCheckerDescription">
            <div className="overallScores">
              <div className={`overallFactCheck ${result?.overall_factuality}`}>
                <div>
                  <h6>Overall Fact-check</h6>
                  <h3>{capitalize(result?.overall_factuality)}</h3>
                </div>
                {result?.overall_factuality === "true" ? (
                  <ThumbUpIcon />
                ) : (
                  <ThumbDownIcon />
                )}
              </div>
              <div
                className={`overallFactCheck ${
                  result?.overall_credibility >= 0.9 ? "true" : "false"
                }`}
              >
                <div>
                  <h6>Overall Credibility</h6>
                  <h3>
                    {result?.overall_credibility
                      ? (result?.overall_credibility * 100).toFixed(1) + "%"
                      : 0}
                  </h3>
                </div>
                {result?.overall_credibility >= 0.9 ? (
                  <ThumbUpIcon />
                ) : (
                  <ThumbDownIcon />
                )}
              </div>
            </div>

            {result?.detailed_claims?.length > 0 && (
              <>
                <h3>Detected Claims</h3>
                <ol>
                  {result?.detailed_claims?.map((data, index) => (
                    <li key={index}>{data.claim}</li>
                  ))}
                </ol>
              </>
            )}

            <div className="factCheckerDetails">
              {result?.detailed_claims?.length > 0 && <h3>Fact Details</h3>}
              {result?.detailed_claims.map((detail, index) => (
                <div
                  key={index}
                  className={`factCheckerInfo ${index === 0 ? "first" : ""}`}
                >
                  <div className={`factClaim ${detail.factuality_status}`}>
                    <h4>
                      {detail?.id}. {detail?.claim}
                    </h4>
                  </div>

                  <div className="fcInner">
                    <h5>Reasoning</h5>
                    <p>{detail.reasoning}</p>
                  </div>

                  {detail.factuality_status === "false" && (
                    <>
                      <div className="fcInner">
                        <h5>Error</h5>
                        <p>{detail.error}</p>
                      </div>

                      <div className="fcInner">
                        <h5>Correction</h5>
                        <p>{detail.correction}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
