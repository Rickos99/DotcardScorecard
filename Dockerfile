FROM httpd:2.4-alpine

COPY ./public_html/ /usr/local/apache2/htdocs/
