const { chromium } = require(process.env.PW);
(async () => {
  const [, , html, outDir, fps, dur, only] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("file://" + html);
  await p.evaluate(async () => { await document.fonts.load("600 40px Outfit"); await document.fonts.load("800 40px Outfit"); await document.fonts.load("400 40px Outfit"); });
  await p.waitForTimeout(500);
  console.log("font ok:", await p.evaluate(() => document.fonts.check("700 40px Outfit")));
  const canvas = p.locator("canvas");
  const times = only ? only.split(",").map(Number) : [...Array(Math.round(fps * dur)).keys()].map((i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate((t) => window.render(t), times[i]);
    await canvas.screenshot({ path: `${outDir}/f${String(i).padStart(4, "0")}.png` });
  }
  console.log("frames", times.length, "errors", errs);
  await b.close();
})();
