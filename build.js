"format register";

System.register("src/main", [], false, function(__require, __exports, __module) {
  System.get("@@global-helpers").prepareGlobal(__module.id, []);
  (function() {
    System.import('src/calendar');
    System.import('src/map');
  }).call(System.global);
  return System.get("@@global-helpers").retrieveGlobal(__module.id, false);
});



//# sourceMappingURL=build.js.map