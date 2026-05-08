import re
from datetime import datetime

MONTHS = {
    "jan":1,"january":1,
    "feb":2,"february":2,
    "mar":3,"march":3,
    "apr":4,"april":4,
    "may":5,
    "jun":6,"june":6,
    "jul":7,"july":7,
    "aug":8,"august":8,
    "sep":9,"september":9,
    "oct":10,"october":10,
    "nov":11,"november":11,
    "dec":12,"december":12
}

def extract_experience(text: str):

    text = text.lower()
    today = datetime.today()

    # -------- Extract ONLY work experience section --------
    match = re.search(r'work experience(.*?)(projects|education|skills|certifications|$)', text, re.DOTALL)

    if match:
        text = match.group(1)

    ranges = []

    # Month Year - Current
    p1 = r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})\s*[-–]\s*(present|current)'
    for m in re.findall(p1, text):
        start = datetime(int(m[1]), MONTHS[m[0]], 1)
        ranges.append((start, today))

    # Month Year - Month Year
    p2 = r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})\s*[-–]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})'
    for m in re.findall(p2, text):
        start = datetime(int(m[1]), MONTHS[m[0]], 1)
        end = datetime(int(m[3]), MONTHS[m[2]], 1)
        ranges.append((start, end))

    # Year - Current
    p3 = r'(\d{4})\s*[-–]\s*(present|current)'
    for m in re.findall(p3, text):
        start = datetime(int(m[0]), 1, 1)
        ranges.append((start, today))

    # Year - Year
    p4 = r'(\d{4})\s*[-–]\s*(\d{4})'
    for m in re.findall(p4, text):
        start = datetime(int(m[0]), 1, 1)
        end = datetime(int(m[1]), 12, 31)
        ranges.append((start, end))

    
    if not ranges:
        return 0

    # Remove duplicates
    ranges = list(set(ranges))

    # Sort
    ranges.sort(key=lambda x: x[0])

    # Merge overlapping
    merged = [ranges[0]]

    for start, end in ranges[1:]:
        last_start, last_end = merged[-1]

        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))

    total_days = sum((end - start).days for start, end in merged)

    return round(total_days / 365, 1)
    