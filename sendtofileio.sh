source ./.env
curl -s --request POST \
  --url 'https://file.io/?=' \
  --header "Authorization: Bearer ${fileioapikey}" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@$1 | jq '.link'
