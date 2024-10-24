#!/usr/bin/env node

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const oclif = await import("@oclif/core");
  const pathx = new URL(".", import.meta.url).pathname;
  await oclif.execute({ dir: pathx });
})();
