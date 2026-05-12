def build_prompt(candidate, job_description, semantic_score, final_score, shortlisted):

    skills = ", ".join(candidate["skills"])
    certs = ", ".join(candidate["certifications"]) if candidate["certifications"] else "None"

    prompt = f"""
    You are an AI recruitment assistant.

    Evaluate the candidate against the job description.

    IMPORTANT RULES:
    - Return ONLY valid JSON.
    - Do NOT include text outside JSON.
    - All fields MUST be filled.
    - "reasoning" must contain 2–3 sentences explaining the decision.
    - "strengths" must list relevant candidate skills.
    - "weaknesses" must list missing or weak skills.
    - DO NOT override the Final Score decision logic.
    
    JOB DESCRIPTION:
    {job_description}

    CANDIDATE PROFILE
    Candidate: {candidate['candidate']}
    Skills: {skills}
    Experience: {candidate['experience_years']} years
    Certifications: {certs}
    shortlisted: {"Yes" if shortlisted else "No"}

    MATCH SCORES
    Semantic Score: {semantic_score}
    Final Score: {final_score}

    TASK:
    1. Use Final Score to assign match_level, only if candidate is {shortlisted}, else give match level as "Low"
    - "match_level" MUST be anyone derived ONLY from {final_score}:
        when the candidate is not {shortlisted}, then match_level should be "Low" regardless of {final_score} and go to task 2
        - if {final_score}>= 60 then put "match_level": "High" and go to task 2
        - else if {final_score}>= 40 and {final_score}< 60 then put "match_level": "Medium" and go to task 2
        - else {final_score}< 40 then "match_level": "Low", 
    2.Based on match level, provide recommendation
    - "recommendation" MUST follow:
        - High -> Interview
        - Medium -> Consider
        - Low -> Reject
        provide resommendation of high or medium only is candidate is {shortlisted}, else Reject
    3. Justify why the Final Score is reasonable based on skills only.
    4. DO NOT change decision logic
    5. Focus on explanation, not re-scoring


    Return JSON in this exact format:

    {{
    "candidate": "{candidate['candidate']}",
    "match_level": "",
    "strengths": [],
    "weaknesses": [],
    "reasoning": "",
    "recommendation": ""
    }}
    """
    return prompt
