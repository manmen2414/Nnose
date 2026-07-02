import { get, set, setMany } from "idb-keyval";
import { getTimeZonedDate, isInvalidDate } from "./util";
import type { Config } from "./types";
import { TIMEZONE } from "./const";

export const ID_NOSE = "nnose-nose";
export const ID_LAST = "nnose-last";
export const ID_LAST_SEAT_SUCCESSED = "nnose-last-seat-successed";
export const ID_CONFIG = "nnose-config";

export async function getNoseCount(): Promise<number> {
  const nose = await get(ID_NOSE);
  if (typeof nose !== "number")
    throw new Error(`nnose-nose is not number. type: ${typeof nose}`);
  return nose;
}

export async function setNoseCount(nose: number) {
  return set(ID_NOSE, nose)
    .then((): "stored" => "stored")
    .catch((e): "failed:internalErr" => {
      console.error(e);
      return "failed:internalErr";
    });
}

export async function isNotExistNoseCount(): Promise<boolean> {
  const nose = await get(ID_NOSE);
  return nose === undefined;
}

export async function getLastSeatSuccessed(): Promise<boolean> {
  const successed = await get(ID_LAST_SEAT_SUCCESSED);
  if (typeof successed !== "boolean")
    throw new Error(
      `nnose-last-seat-successed is not number. type: ${typeof successed}`,
    );
  return successed;
}

export async function setLastSeatSuccessed(successed: boolean) {
  return set(ID_LAST_SEAT_SUCCESSED, successed)
    .then((): "stored" => "stored")
    .catch((e): "failed:internalErr" => {
      console.error(e);
      return "failed:internalErr";
    });
}

export async function isNotExistLastSeatSuccessed(): Promise<boolean> {
  const nose = await get(ID_LAST_SEAT_SUCCESSED);
  return nose === undefined;
}

export async function getLast(): Promise<Date> {
  const date = await get(ID_LAST);
  if (!(date instanceof Date))
    throw new Error(`nnose-last is not date. type: ${typeof date}`);
  if (isInvalidDate(date))
    throw new Error(`nnose-last is invalid date. "${date}"`);
  return date;
}

export async function setLast(last: Date) {
  return set(ID_LAST, last)
    .then((): "stored" => "stored")
    .catch((e): "failed:internalErr" => {
      console.error(e);
      return "failed:internalErr";
    });
}

export async function isNotExistLast(): Promise<boolean> {
  const last = await get(ID_LAST);
  return last === undefined;
}

export async function getConfig(): Promise<Config> {
  const config = (await get(ID_CONFIG)) ?? {};
  if (typeof config.offset !== "number") config.offset = 0;

  return config;
}

export async function saveConfig(config: Config) {
  return set(ID_CONFIG, config)
    .then((): "stored" => "stored")
    .catch((e): "failed:internalErr" => {
      console.error(e);
      return "failed:internalErr";
    });
}

export async function isNotExistConfig(): Promise<boolean> {
  const config = await get(ID_CONFIG);
  return config === undefined;
}

export async function dbInit() {
  setMany([
    [ID_NOSE, 0],
    [ID_LAST, getTimeZonedDate(TIMEZONE)],
    [ID_LAST_SEAT_SUCCESSED, false],
    [ID_CONFIG, await getConfig()],
  ]);
}

export type StoreResult =
  | "stored"
  | "stored:updated"
  | "failed"
  | "failed:alreadyStored"
  | "failed:internalErr";
