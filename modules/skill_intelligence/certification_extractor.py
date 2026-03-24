import re

def extract_certifications(text: str):

    text = text.lower()

    patterns = [
        r'.*coursera.*',
        r'.*udemy.*',
        r'.*edx.*',
        r'.*certified.*',
        r'.*certification.*'
        r'.*linkedin learning.*'
        r'.*google cloud.*'
        r'.*google.*'
        r'.*microsoft learn.*'
        r'.*microsoft.*'
        r'.*aws.*'
        r'.*oracle academy.*'
        

    ]

    certifications = []

    lines = text.split("\n")

    for line in lines:
        for pattern in patterns:
            if re.search(pattern, line):
                certifications.append(line.strip())

    return list(set(certifications))