import io
import sys


if __name__ == '__main__':
    # Try to deal with weird encodings coming from source
    infile = io.open(sys.stdin.fileno(), 'r', encoding='utf-8', errors='replace')
    outfile = io.open(sys.stdout.fileno(), 'w', encoding='utf-8')

    for line in infile:
        line = line.encode('ascii', 'backslashreplace')
        line = line.decode('unicode_escape')
        outfile.write(line)
