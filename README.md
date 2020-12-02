# householder

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng serve -c=local` to use `src/environments/environment.local.ts` environment file.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Add `--baseHref` as needed. 

### Example deployment

Under xampp `htdocs`, add symlink `householder-dist` to `dist` directory.

In `httpd.conf` ensure that `FollowSymLinks` is included in the `Options` line for the `htdocs` `Directory` entry.

Also need to add the following:
```
# Redirect requests to /db to :5984 on the same host
<Location "/db/">
   ProxyPass "http://localhost:5984/"
</Location>
```
Ensure that `mod_proxy` and `mod_proxy_html` are enabled.

Run `ng build --prod --base-href /householder-dist/`.

Note that the above command does not work in Windows git bash. Use cmd to run.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Development Notes

I needed to create an empty `.env` file in `backend/vendor/php-on-couch/php-on-couch/src`.

## Building for docker

`ng build --prod --base-href /`