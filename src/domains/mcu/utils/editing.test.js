import { describe, expect, it } from "vitest";
import {
  domainOptions,
  draftFromRaw,
  draftToRequest,
  emptyDraft,
  episodeToRequest,
  findRaw,
  nextEpisodeNumber,
  nextSeasonDraft,
} from "./editing";

const data = {
  domains: [
    {
      domainName: "Phase 4",
      movies: [
        {
          id: 7,
          globalId: "movie:7",
          title: "Werewolf by Night",
          type: "SPECIAL",
          premiereDate: "2022-10-07",
          runtime: 53,
          synopsis: "Monsters.",
        },
      ],
      shows: [
        {
          id: 3,
          globalId: "show:3",
          title: "Loki",
          seasonNumber: 1,
          premiereDate: "2021-06-09",
          synopsis: "Variant.",
          episodes: [
            { id: 10, globalId: "episode:10", episodeNumber: 1 },
            { id: 12, globalId: "episode:12", episodeNumber: 3 },
          ],
        },
      ],
    },
    { domainName: "Fox X-Men Universe", movies: [], shows: [] },
    { domainName: "Defenders", movies: [], shows: [] },
  ],
};

describe("findRaw", () => {
  it("finds a movie with its domain", () => {
    const raw = findRaw(data, "movie:7");
    expect(raw.kind).toBe("movie");
    expect(raw.domain).toBe("Phase 4");
  });
  it("finds a season with its episodes", () => {
    const raw = findRaw(data, "show:3");
    expect(raw.show.seasonNumber).toBe(1);
    expect(raw.show.episodes).toHaveLength(2);
  });
  it("returns null for unknown ids", () => {
    expect(findRaw(data, "movie:999")).toBeNull();
  });
});

describe("domainOptions", () => {
  it("lists every saga phase first, then other domains alphabetically", () => {
    expect(domainOptions(data)).toEqual([
      "Phase 1",
      "Phase 2",
      "Phase 3",
      "Phase 4",
      "Phase 5",
      "Phase 6",
      "Phase 7",
      "Phase 8",
      "Phase 9",
      "Defenders",
      "Fox X-Men Universe",
    ]);
  });
});

describe("drafts", () => {
  it("edits a special with its full date and domain", () => {
    expect(draftFromRaw(findRaw(data, "movie:7"))).toMatchObject({
      kind: "special",
      premiereDate: "2022-10-07",
      runtime: "53",
      domain: "Phase 4",
      synopsis: "Monsters.",
    });
  });
  it("edits a season with its synopsis", () => {
    expect(draftFromRaw(findRaw(data, "show:3"))).toMatchObject({
      kind: "show",
      season: "1",
      synopsis: "Variant.",
    });
  });
  it("prefills the next season", () => {
    expect(nextSeasonDraft(findRaw(data, "show:3"))).toMatchObject({
      title: "Loki",
      season: "2",
      domain: "Phase 4",
      synopsis: "",
      premiereDate: "",
    });
  });
  it("suggests the episode after the highest number", () => {
    expect(nextEpisodeNumber(findRaw(data, "show:3").show.episodes)).toBe(4);
    expect(nextEpisodeNumber([])).toBe(1);
  });
});

describe("draftToRequest", () => {
  const movie = {
    ...emptyDraft("movie"),
    title: " Thunderbolts* ",
    premiereDate: "2025-05-02",
    runtime: "127",
    domain: "Phase 5",
    synopsis: " Antiheroes. ",
  };

  it("builds a trimmed movie body", () => {
    expect(draftToRequest(movie)).toEqual({
      ok: true,
      body: {
        title: "Thunderbolts*",
        premiereDate: "2025-05-02",
        runtime: 127,
        synopsis: "Antiheroes.",
        domain: "Phase 5",
        special: false,
      },
    });
  });
  it("requires runtime and synopsis", () => {
    expect(draftToRequest({ ...movie, runtime: "" }).ok).toBe(false);
    expect(draftToRequest({ ...movie, synopsis: "  " }).ok).toBe(false);
  });
  it("builds a season body without runtime", () => {
    const result = draftToRequest({ ...movie, kind: "show", season: "2" });
    expect(result.body).toEqual({
      title: "Thunderbolts*",
      season: 2,
      premiereDate: "2025-05-02",
      synopsis: "Antiheroes.",
      domain: "Phase 5",
    });
  });
  it("rejects a zero season", () => {
    expect(draftToRequest({ ...movie, kind: "show", season: "0" }).ok).toBe(
      false,
    );
  });
});

describe("episodeToRequest", () => {
  it("requires title and runtime", () => {
    expect(
      episodeToRequest({ episodeNumber: "1", title: "", runtime: "50" }).ok,
    ).toBe(false);
    expect(
      episodeToRequest({ episodeNumber: "1", title: "Pilot", runtime: "" }).ok,
    ).toBe(false);
  });
  it("builds a body", () => {
    expect(
      episodeToRequest({ episodeNumber: "2", title: " Optics ", runtime: "45" })
        .body,
    ).toEqual({ episodeNumber: 2, title: "Optics", runtime: 45 });
  });
});
