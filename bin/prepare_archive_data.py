import csv
import re
import sys


def fix_role(role):
    """Split role up into a list and join it back together, trimmed"""
    return ';'.join(role.split())


def fix_decades(decades):
    decade_list = []
    decades = ''.join(re.findall(r'(?:\d|-)+', decades))
    for start in range(0, len(decades), 9):
        decade_list.append(decades[start:start+9])
    return ';'.join(decade_list)


def fix_decription(description):
    # Remove newlines and other whitespace
    description = re.subn(r'\s', ' ', description.strip())[0]

    # Condense the description to the sentence-like strings that are combined
    # below 100 characters
    sentences = description.split('. ')
    condensed = ''
    i = 0
    while i < len(sentences) and len(condensed) < 100:
        sentence = sentences[i].strip()
        if sentence and sentence is not '':
            if i > 0:
                condensed += ' '
            condensed += sentence
            if condensed[len(condensed) - 1] is not '.':
                condensed += '.'
        i += 1

    return condensed


if __name__ == '__main__':
    input_file = csv.DictReader(sys.stdin)
    output_fieldnames = list(input_file.fieldnames)
    output_file = csv.DictWriter(sys.stdout, output_fieldnames)
    output_file.writeheader()

    for row in input_file:
        row['Decades'] = fix_decades(row['Decades'])
        row['Description'] = fix_decription(row['Description'])
        row['Role'] = fix_role(row['Role'])
        output_file.writerow(row)
