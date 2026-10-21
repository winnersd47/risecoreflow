const WP = "https://commons.wikimedia.org/wiki/Special:FilePath";

// Test candidates for 3 failing steps
const candidates = {
  // OMF tip: "5 вещей, которые OmniMindFlow делает за 30 секунд" — multiple devices / productivity
  "omf-tip": [
    `${WP}/Laptop_at_a_startup.jpg`,
    `${WP}/Laptop_desk.jpg`,
    `${WP}/MacBook_Pro_running_macOS_Big_Sur.jpg`,
    `${WP}/MacBook_with_Retina_Display.jpg`,
    `${WP}/Laptop_work_from_home.jpg`,
    `${WP}/Notebooks_PC.jpg`,
  ],
  // AEF story: "Почему мы создали AutoEvoFlow" — Porsche (simple filename)
  "aef-story": [
    `${WP}/Porsche_997_GT3_RS_3.8.jpg`,
    `${WP}/Porsche_911_Turbo.jpg`,
    `${WP}/Porsche_991_GT3_RS_Nurburgring.jpg`,
    `${WP}/2010_Porsche_911_Carrera_S_--_NRMA_Driver_Safety.jpg`,
    `${WP}/Porsche_911_GT3.jpg`,
    `${WP}/2005_Porsche_997_Carrera_S.jpg`,
  ],
  // AEF pain: "Вопрос, на который нет ответа — пока" — BMW model comparison
  "aef-pain": [
    `${WP}/BMW_M3_E46.jpg`,
    `${WP}/BMW_5_Series_E60_520i_FL.jpg`,
    `${WP}/BMW_E90_sedan.jpg`,
    `${WP}/BMW_3_Series_G20_China.jpg`,
    `${WP}/BMW_530e_2020.jpg`,
    `${WP}/BMW_M5_F90.jpg`,
  ],
};

for (const [key, urls] of Object.entries(candidates)) {
  console.log(`\n--- ${key} ---`);
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      const ct = res.headers.get("content-type") || "?";
      const ok = ct.startsWith("image/") ? "✓ IMAGE" : `✗ ${ct.split(";")[0]}`;
      console.log(ok, res.status, url.split("FilePath/")[1]?.slice(0, 55));
    } catch (e) {
      console.log("✗ ERR  ", url.split("FilePath/")[1]?.slice(0, 55), e.message.slice(0,40));
    }
  }
}
