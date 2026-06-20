import staticEvents from "./eventsData.json";

export function getStaticEvents() {
  return staticEvents.map((event) => ({ ...event }));
}
