import { TIMEZONE } from "./const";
import {
  getLast,
  getLastSeatSuccessed,
  getNoseCount,
  setLast,
  setLastSeatSuccessed,
  setNoseCount,
} from "./db";
import { getDateCode, getTimeZonedDate } from "./util";
import { RESTDAY_DEFINE } from "./weekend";

const TIMES = {
  countStart: [8, 30],
  schoolStart: [8, 35],
} as const;

let todaySeated = false;
let nowNose = 0;

const nowNoseInitailize = getNoseCount()
  .then((n) => {
    nowNose = n;
  })
  .catch(console.error);
const todaySeatedInitailize = getLast()
  .then((last) =>
    getDateCode(last) === getDateCode(new Date())
      ? getLastSeatSuccessed()
      : Promise.resolve(false),
  )
  .then((l) => {
    todaySeated = l;
    return setLastSeatSuccessed(l);
  })
  .catch(console.error);

export async function calcNowNose() {
  await nowNoseInitailize;
  let nose = nowNose;

  if (isNotSchoolStarted() && !todaySeated) {
    const now = getTimeZonedDate(TIMEZONE);

    const countStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      ...TIMES.countStart,
      0,
      0,
    );
    const schoolStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      ...TIMES.schoolStart,
      0,
      0,
    );

    const nowMillSecond = now.valueOf() - countStart.valueOf();
    if (nowMillSecond < 0) return nose;
    const maxMillSecond = schoolStart.valueOf() - countStart.valueOf();
    nose += Math.floor((nowMillSecond / maxMillSecond) * 10000) / 10000;
  }
  return nose;
}

export async function seated() {
  todaySeated = true;
  await setLastSeatSuccessed(todaySeated);
  await setLast(getTimeZonedDate(TIMEZONE));
}
export async function getTodaySeated() {
  await todaySeatedInitailize;
  return todaySeated;
}
export async function addNose() {
  await setNoseCount(++nowNose);
}

export function isRestDay() {
  const now = getTimeZonedDate(TIMEZONE);
  if (now.getDay() % 6 === 0) return true;
  const dateC = getDateCode(now);
  return RESTDAY_DEFINE.some((n) =>
    typeof n === "number" ? n === dateC : n[0] <= dateC && dateC <= n[1],
  );
}

export function isNotSchoolStarted() {
  const now = getTimeZonedDate(TIMEZONE);
  const hour = now.getHours(),
    minute = now.getMinutes();

  return hour <= TIMES.schoolStart[0] && minute < TIMES.schoolStart[1];
}
