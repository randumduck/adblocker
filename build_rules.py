import urllib.request
import json
import ssl

# We now use an array of feeds to aggregate our threat intelligence
FEEDS = [
    # Peter Lowe's Ad/Tracking List (Clean domains)
    {"url": "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=nohtml&showintro=0&mimetype=plaintext", "type": "plain"},
    
    # StevenBlack's Unified Hosts (Massive list of adware/malware)
    {"url": "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts", "type": "hosts"}
]

OUTPUT_FILE = "dynamic_rules.json"
MAX_RULES = 29000  # MV3 safe limit

def generate_rules():
    print("Initializing Threat Intelligence Aggregation...")
    
    # --- SSL BYPASS: Create an unverified context to fix the Linux cert error ---
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    unique_domains = set()

    # 1. Fetch and parse all feeds
    for feed in FEEDS:
        print(f"Downloading from: {feed['url'][:50]}...")
        try:
            req = urllib.request.Request(feed['url'], headers={'User-Agent': 'Mozilla/5.0'})
            
            # Use the unverified context here
            response = urllib.request.urlopen(req, context=ctx)
            data = response.read().decode('utf-8')
            
            lines = data.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # Parse logic depends on the type of list
                if feed['type'] == 'plain':
                    unique_domains.add(line)
                elif feed['type'] == 'hosts':
                    # Hosts files look like: "0.0.0.0 badsite.com"
                    parts = line.split()
                    if len(parts) >= 2 and parts[0] in ('0.0.0.0', '127.0.0.1'):
                        domain = parts[1]
                        if domain != 'localhost':
                            unique_domains.add(domain)
                            
        except Exception as e:
            print(f"Failed to process feed: {e}")

    # 2. Convert to Manifest V3 JSON
    print(f"\nAggregated {len(unique_domains)} unique domains. Converting to MV3 JSON...")
    
    rules = []
    rule_id = 1

    for domain in sorted(unique_domains):
        rule = {
            "id": rule_id,
            "priority": 1,
            "action": { "type": "block" },
            "condition": {
                "urlFilter": f"||{domain}^", 
                "resourceTypes": ["main_frame", "sub_frame", "script", "image", "xmlhttprequest", "ping"]
            }
        }
        rules.append(rule)
        rule_id += 1

        # Enforce the strict browser cap
        if rule_id > MAX_RULES:
            print(f"Reached browser safety cap of {MAX_RULES} rules. Truncating.")
            break

    # 3. Save Payload
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(rules, f, indent=2)

    print(f"Success! Generated {len(rules)} compiled rules in {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_rules()