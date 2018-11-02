import { TestBed, inject } from "@angular/core/testing";

import { SpieltagService } from "./spieltag.service";

describe("SpieltagService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpieltagService]
    });
  });

  it("should be created", inject([SpieltagService], (service: SpieltagService) => {
    expect(service).toBeTruthy();
  }));
});
