import urllib.request
import json

# URL for Peter Lowe's Ad and Tracking Server List (excellent, clean list for blocking)
# We use this one because it's purely domains, making it very easy to parse into MV3 JSON
BLOCKLIST_URL = "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=nohtml&showintro=0&mimetype=plaintext"
OUTPUT_FILE = "dynamic_rules.json"

def generate_rules():
    print(f"Downloading ad and tracker domains...")
    
    try:
        response = urllib.request.urlopen(BLOCKLIST_URL)
        data = response.read().decode('utf-8')
        domains = data.split('\n')
    except Exception as e:
        print(f"Error downloading list: {e}")
        return

    rules = []
    rule_id = 1

    print("Converting to Manifest V3 JSON format...")
    
    for domain in domains:
        domain = domain.strip()
        
        # Skip empty lines or comments
        if not domain or domain.startswith('#'):
            continue
            
        # Build the MV3 JSON rule object
        rule = {
            "id": rule_id,
            "priority": 1,
            "action": { "type": "block" },
            "condition": {
                # urlFilter targeting the specific domain
                "urlFilter": f"||{domain}^", 
                "resourceTypes": [
                    "main_frame", "sub_frame", "script", 
                    "image", "xmlhttprequest", "ping"
                ]
            }
        }
        rules.append(rule)
        rule_id += 1

        # Safety limit: Browsers usually cap dynamic rules around 30,000.
        # This list is usually around 3,000-5,000 domains, keeping it very safe and fast.
        if rule_id > 25000: 
            break

    # Save to the JSON file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(rules, f, indent=2)

    print(f"Success! Generated {len(rules)} rules in {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_rules()