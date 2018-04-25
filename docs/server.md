# Server

The server is hosted at [Digital Ocean](https://www.digitalocean.com/) under the team **Frick Directory Map**. The droplet is a small one (1GB RAM, 25GB disk) running Ubuntu 16.04. The setup of the server is relatively standard, and for consistency we have set it up following Digital Ocean's guides:

 1. [Initial server setup using Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04)
 1. [How to install Nginx on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)
 1. [How to secure Nginx with Let's Encrypt on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)

The server runs Nginx and uses Let's Encrypt for SSL. Let's Encrypt certificates are automatically renewed.

## Domain

An A record for `directorymap.frick.org` points to the Digital Ocean droplet.

## Serving the map

The map is served through the default Nginx site (`/etc/nginx/sites-available/default`). The root directory (`/var/www/html`) is symlinked to the site in `/home/eric/map`.

---

*This information is up to date as of April 2018.*
