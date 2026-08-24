export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "尋",
  reading: process.env.NEXT_PUBLIC_BRAND_READING ?? "たずね",
  latin: "TAZUNE",
  mark: process.env.NEXT_PUBLIC_BRAND_MARK ?? "tazune-glyph",
  provisional: true,
  title: "尋｜公開情報と目撃をつなぐ",
  description: "指名手配・公開捜査情報と、市民の目撃を安全に整理・接続する全国対応プラットフォーム。",
} as const;
