#!/usr/bin/env ts-node

// eslint-disable-next-line n/shebang, unicorn/prefer-top-level-await
(async () => {
  const oclif = await import("@oclif/core");
  const pathx = new URL(".", import.meta.url).pathname;
  await oclif.execute({ development: true, dir: pathx });
})();
