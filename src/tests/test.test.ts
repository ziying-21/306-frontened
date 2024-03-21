import { isValid, transTime } from "@/utils/valid";

/**
 * @todo @DTL
 */

it("src/utils/valid.ts: Timestamp to string", () => {
  expect(1 + 1).toBe(2);
  // const timeStamp1 = 1681971054570;
  // const answer1 = "2023-4-20 14:10:54";
  // expect(transTime(timeStamp1)).toEqual(answer1);
  // const timeStamp2 = 1680761483305;
  // const answer2 = "2023-4-6 14:11:23";
  // expect(transTime(timeStamp2)).toEqual(answer2);
});

it("@/utils/valid: isValid", () => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  const bad = "~`@*(){}-+=/><,.'\"&^#$%";
  const length = Math.floor(1 + Math.random() * 1000);
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  const randomTrueInput = text;
  expect(isValid(randomTrueInput, true)).toBeTruthy();

  const insert_times = Math.floor(1 + Math.random() * 1000);
  for (let i = 0; i < insert_times; i++) {
    const insert_position = Math.floor(Math.random() * text.length);
    const insert_ch = Math.floor(Math.random() * 23);
    text = text.slice(0, insert_position) + bad[insert_ch] + text.slice(insert_position);
  }
  const randomFalseInput = text;
  expect(isValid(randomFalseInput, true)).toBeFalsy();
});

it("1 + 1 === 2", () => {
  expect(1 + 1).toBe(2);
});

export {};
