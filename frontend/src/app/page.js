"use client";
import CustomInput from "@/components/atoms/inputs/CustomInput";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { capitalize } from "@mui/material";

export default function Home() {
 
  const sampleResponse = {
    pipeline: [
      "factool_claimprocessor",
      "factool_retriever",
      "factool_verifier",
    ],
    detected_claims: ["Jupiter is a planet", "Jupiter is the smallest planet"],
    evidence_count: 8,
    supported_claims: 1,
    conflicted_claims: 1,
    controversial_claims: 0,
    unverified_claims: 0,
    overall_factuality: "false",
    overall_credibility: 0.5,
    detailed_claims: [
      {
        id: 1,
        claim: "Jupiter is a planet",
        factuality_status: "true",
        error: null,
        reasoning:
          "The given text states that 'Jupiter is a planet.' The provided evidences consistently describe Jupiter as the fifth planet from the Sun and the largest in the solar system. All evidences support the fact that Jupiter is indeed a planet, specifically a gas giant, and there are no contradictions among the evidences regarding this fact.",
        correction: "None",
        evidences: [
          {
            question: "Is Jupiter a planet? Jupiter planet status",
            sources: [
              "Jupiter is the fifth planet from the Sun, and the largest in the solar system – more than twice as massive as the other planets combined.",
              "Jupiter is above the horizon from Greenwich, UK. · Right now it is placed in the West-North-West direction at an altitude of 9.43° above the horizon. · Given its ...",
              "Jupiter is the fifth planet from the Sun, and the largest in the solar system – more than twice as massive as the other planets combined.",
              "Jupiter is the fifth closest planet to the Sun and is the first of what are called the outer planets (being outside the asteroid belt).",
              "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than 2.5 times that of all the other planets ...",
              "Jupiter is currently in the constellation of Taurus. The current Right Ascension is 04h 50m 49s and the Declination is +22° 08' 10” .",
            ],
          },
        ],
      },
      {
        id: 2,
        claim: "Jupiter is the smallest planet",
        factuality_status: "false",
        error:
          "The text incorrectly states that Jupiter is the smallest planet.",
        reasoning:
          "The given text states that Jupiter is the smallest planet. However, the provided evidence indicates that Jupiter is extremely large, with a volume over 1,300 times that of Earth, and it weighs two and a half times the weight of all the other eight planets combined. Additionally, Mercury is mentioned in the evidence, which is known to be the smallest planet in the solar system. Therefore, the statement in the text is factually incorrect.",
        correction: "Jupiter is the largest planet.",
        evidences: [
          {
            question:
              "What is the smallest planet in the solar system? Jupiter size compared to other planets",
            sources: [
              "Mercury",
              "It's volume is over 1,300 times the volume of Earth. This means that Jupiter is so big that over 1,300 Earths could fit inside of it. Jupiter is so big that it weighs two and a half times the weight of all of the other eight planets put together!",
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="home customContainer">
      <div className="factCheckerMain">
        <div className="factCheckerForm">
          <h1 className="text-lg">Fact Checker</h1>
          <CustomInput
            label="Type here..."
            placeholder="Type here..."
            endAdornment={
              <CustomButton type="submit" variant="contained" label="Submit" />
            }
          />
        </div>
        <div className="claimsInfoCnt">
          <div className="claimsInfo">
            <h4>{sampleResponse.detected_claims?.length}</h4>
            <p>Detected Claims</p>
          </div>
          <div className="claimsInfo">
            <h4>{sampleResponse.evidence_count}</h4>
            <p>Retrieved Evidences</p>
          </div>
          <div className="claimsInfo">
            <h4>{sampleResponse.supported_claims}</h4>
            <p>Supported Claims</p>
          </div>
          <div className="claimsInfo">
            <h4>{sampleResponse.conflicted_claims}</h4>
            <p>Conflicted Claims</p>
          </div>
          <div className="claimsInfo">
            <h4>{sampleResponse.controversial_claims}</h4>
            <p>Controversial Claims</p>
          </div>
          <div className="claimsInfo">
            <h4>{sampleResponse.unverified_claims}</h4>
            <p>Unverified Claims</p>
          </div>
        </div>
      </div>

      <div className="factCheckerDescription">
        <div className="overallScores">
          <div className={`overallFactCheck ${sampleResponse?.overall_factuality}`}>
            <div>
              <h6>Overall Fact-check</h6>
              <h3>{capitalize(sampleResponse?.overall_factuality)}</h3>
            </div>
            <ThumbDownIcon />
          </div>
          <div className={`overallFactCheck ${sampleResponse?.overall_credibility >= 0.9 ? 'true' : 'true'}`}>
            <div>
              <h6>Overall Credibility</h6>
              <h3>
                {sampleResponse?.overall_credibility
                  ? (sampleResponse?.overall_credibility * 100).toFixed(1) + "%"
                  : 0}
              </h3>
            </div>
            <ThumbUpIcon />
          </div>
        </div>

        <h3>Detected Claims</h3>
        <ol>
          {sampleResponse?.detailed_claims?.map((data, index) => (
            <li key={index}>{data.claim}</li>
          ))}
        </ol>

        <div className="factCheckerDetails">
          <h3>Fact Details</h3>
          {sampleResponse?.detailed_claims.map((detail, index) => (
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
    </div>
  );
}
