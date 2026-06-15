import { createMemoryPhotoLibrary } from "./photoLibrary";

describe("photoLibrary", () => {
  it("adds and lists photos by route", async () => {
    const library = createMemoryPhotoLibrary();
    const file = new File(["image"], "taiping.jpg", { type: "image/jpeg" });

    const added = await library.addRoutePhotos("qinling-taiping", "taiping-park", [file]);
    const photos = await library.listRoutePhotos("qinling-taiping");

    expect(added).toHaveLength(1);
    expect(photos).toMatchObject([
      {
        routeId: "qinling-taiping",
        stopId: "taiping-park",
        name: "taiping.jpg",
        type: "image/jpeg"
      }
    ]);
  });

  it("counts and deletes route photos", async () => {
    const library = createMemoryPhotoLibrary();
    const file = new File(["image"], "one.jpg", { type: "image/jpeg" });
    const [photo] = await library.addRoutePhotos("route-a", undefined, [file]);
    await library.addRoutePhotos("route-b", undefined, [file]);

    expect(await library.countPhotosByRoute()).toEqual({
      "route-a": 1,
      "route-b": 1
    });

    await library.deleteRoutePhoto(photo.id);

    expect(await library.countPhotosByRoute()).toEqual({
      "route-b": 1
    });
  });

  it("notifies subscribers after mutations", async () => {
    const library = createMemoryPhotoLibrary();
    const listener = vi.fn();
    const unsubscribe = library.subscribe(listener);

    const [photo] = await library.addRoutePhotos("route-a", undefined, [
      new File(["image"], "one.jpg", { type: "image/jpeg" })
    ]);
    await library.deleteRoutePhoto(photo.id);
    unsubscribe();
    await library.addRoutePhotos("route-a", undefined, [
      new File(["image"], "two.jpg", { type: "image/jpeg" })
    ]);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
