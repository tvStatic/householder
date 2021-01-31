// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// use `ng serve -c=local to use `environment.local.ts`, which should be copied from this file.

export const environment = {
  production: false,
  dbName: "", // set to connect to hard-coded couchdb server - if not prefixed with http then assumes same location
  username: "", // username when connecting to hard-coded server
  pw: "", // password when connecting to hard-coded server
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
