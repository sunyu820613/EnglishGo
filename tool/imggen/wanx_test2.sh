#!/usr/bin/env bash
set -euo pipefail
source "$HOME/.englishgo_secrets/dashscope.env"

PROMPT="A single friendly cartoon ant, dark reddish-brown color, centered on a warm cream background. The ant has exactly six legs, two antennae with small round tips, two large round friendly eyes, a small smile, and three clearly segmented body parts (head, thorax, abdomen). Soft-clay 3D picture-book illustration style: rounded plump segments, thick warm dark-brown outline (not black), soft directional studio lighting from the upper-left at 45 degrees creating a soft highlight and gentle shadow, subtle soft shadow underneath, no gradients beyond soft light-to-shadow falloff, no text, no watermark, no additional objects, high-quality children's book illustration, anatomically correct insect with six legs, 1:1 square composition, plenty of whitespace around the subject, side-view or three-quarter view standing pose."

RESP=$(curl -sS --location "https://${WAN_WORKSPACE_HOST}/api/v1/services/aigc/multimodal-generation/generation" \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${DASHSCOPE_API_KEY}" \
  --data "{
    \"model\": \"wan2.7-image-pro\",
    \"input\": {
      \"messages\": [
        {\"role\": \"user\", \"content\": [{\"text\": \"${PROMPT}\"}]}
      ]
    },
    \"parameters\": {
      \"size\": \"1K\",
      \"n\": 1,
      \"watermark\": false
    }
  }")

echo "$RESP" > "$(dirname "$0")/wanx_test2_response.json"
IMG_URL=$(echo "$RESP" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);const url=j.output.choices[0].message.content[0].image;console.log(url);}catch(e){console.error('PARSE_ERROR:',d);process.exit(1);}})")

if [ -z "$IMG_URL" ]; then
  echo "No image URL found. Full response:"
  cat "$(dirname "$0")/wanx_test2_response.json"
  exit 1
fi

echo "Image URL: $IMG_URL"
curl -sS -o "$(dirname "$0")/wanx_test_ant.png" "$IMG_URL"
echo "Saved to $(dirname "$0")/wanx_test_ant.png"
