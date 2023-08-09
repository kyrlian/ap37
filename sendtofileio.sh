source ./.env
curl --request POST \
  --url 'https://file.io/?=' \
  --header "Authorization: Bearer ${fileioapikey}" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/Users/serra/Downloads/ap37/custom.js
