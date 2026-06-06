<script setup lang="ts">
import type {
  CalendarOptions,
  DatesSetArg,
  EventClickArg,
  EventInput,
  PluginDef,
} from '@fullcalendar/core';
import ruLocale from '@fullcalendar/core/locales/ru';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {
  type DateClickArg,
} from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { computed, type ComputedRef, type Ref, ref } from 'vue';

import type { EventDto, EventGetListDto } from '@shared/dtos';

interface EventCalendarProps {
  events: EventDto[];
  initialView?: EventCalendarView;
}

interface EventCalendarEmits {
  (event: 'eventClick', value: EventDto): void;
  (event: 'slotClick', value: Date): void;
  (event: 'rangeChange', value: EventGetListDto): void;
}

type EventCalendarView =
  | 'dayGridMonth'
  | 'multiMonthYear'
  | 'timeGridDay'
  | 'timeGridWeek';

const props: EventCalendarProps = defineProps<EventCalendarProps>();
const emit: EventCalendarEmits = defineEmits<EventCalendarEmits>();

const { locale } = useI18n();

const PLUGINS: PluginDef[] = [
  dayGridPlugin,
  interactionPlugin,
  multiMonthPlugin,
  timeGridPlugin,
];
const LOCALES: CalendarOptions['locales'] = [ruLocale];
const HEADER_TOOLBAR: CalendarOptions['headerToolbar'] = {
  left: 'prev,next today',
  center: 'title',
  right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay',
};

const calendarRef: Ref<InstanceType<typeof FullCalendar> | null> = ref(null);
const lastRange: Ref<string> = ref('');

const calendarOptions: ComputedRef<CalendarOptions> = computed(
  (): CalendarOptions => ({
    plugins: PLUGINS,
    initialView: props.initialView ?? 'timeGridWeek',
    locales: LOCALES,
    locale: locale.value,
    firstDay: 1,
    height: '74vh',
    nowIndicator: true,
    allDaySlot: false,
    scrollTime: '08:00:00',
    dayMaxEvents: true,
    headerToolbar: HEADER_TOOLBAR,
    events: props.events.map(toCalendarEvent),
    datesSet: onDatesSet,
    dateClick: onDateClick,
    eventClick: onEventClick,
  })
);

function gotoDate(date: Date): void {
  calendarRef.value?.getApi().gotoDate(date);
}

function onDatesSet(arg: DatesSetArg): void {
  const range: string = `${arg.startStr}/${arg.endStr}`;

  if (range === lastRange.value) {
    return;
  }

  lastRange.value = range;

  const dto: EventGetListDto = {
    from: arg.start.toISOString(),
    to: arg.end.toISOString(),
  };

  emit('rangeChange', dto);
}

function onDateClick(arg: DateClickArg): void {
  emit('slotClick', arg.date);
}

function onEventClick(arg: EventClickArg): void {
  const event: EventDto | undefined = props.events.find(
    (candidate: EventDto): boolean => String(candidate.id) === arg.event.id
  );

  if (event) {
    emit('eventClick', event);
  }
}

function toCalendarEvent(event: EventDto): EventInput {
  const title: string = event.opponent
    ? `${event.title} vs ${event.opponent}`
    : event.title;
  const tag: string | undefined = event.team?.game?.organization?.tag;

  return {
    id: String(event.id),
    title: tag ? `[${tag}] ${title}` : title,
    start: event.startsAt,
    end: event.endsAt ?? undefined,
    classNames: [
      'event-calendar__event',
      `event-calendar__event--${event.type}`,
    ],
  };
}

defineExpose({ gotoDate });
</script>

<template>
  <div class="event-calendar">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<style lang="scss" scoped>
.event-calendar {
  --fc-border-color: #{$border};
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: #{$bg-card-alt};
  --fc-today-bg-color: #{$accent-soft};
  --fc-button-bg-color: #{$bg-card-alt};
  --fc-button-border-color: #{$border-light};
  --fc-button-hover-bg-color: #{$bg-card-hover};
  --fc-button-hover-border-color: #{$border-light};
  --fc-button-active-bg-color: #{$accent};
  --fc-button-active-border-color: #{$accent};
  --fc-button-text-color: #{$text-secondary};
  --fc-event-border-color: transparent;
  --fc-event-text-color: #{$text-primary};
  --fc-now-indicator-color: #{$color-loss};
  --fc-more-link-bg-color: #{$bg-card-hover};
  --fc-more-link-text-color: #{$text-dim};

  :deep(.fc-toolbar-title) {
    font-size: 1.15rem;
  }

  :deep(.fc-scroller) {
    scrollbar-width: thin;
    scrollbar-color: $border-light transparent;
  }

  :deep(.fc-scroller-harness:not(.fc-scroller-harness-liquid) .fc-scroller) {
    scrollbar-color: transparent transparent;
  }

  :deep(.fc-scrollgrid-section-header .fc-col-header-cell) {
    border-bottom: 0;
  }

  :deep(.fc-scrollgrid-section-header .fc-scroller-harness) {
    border-bottom: 1px solid $border;
  }

  :deep(.fc-col-header-cell-cushion),
  :deep(.fc-daygrid-day-number) {
    color: $text-dim;
    text-decoration: none;
  }

  :deep(.fc-day-today .fc-col-header-cell-cushion),
  :deep(.fc-day-today .fc-daygrid-day-number) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.8rem;
    height: 1.8rem;
    margin: 0.15rem;
    padding: 0 0.4rem;
    border-radius: 50%;
    background: $accent;
    color: $text-primary;
    font-weight: 600;
  }

  :deep(.fc-timegrid-slot-label-cushion),
  :deep(.fc-timegrid-axis-cushion) {
    color: $text-muted;
    font-size: 0.8rem;
  }

  :deep(.fc-timegrid-slot) {
    height: 2.4rem;
  }

  :deep(.fc-multimonth-title) {
    color: $text-secondary;
  }

  :deep(.fc-multimonth) {
    border-color: $border;
  }

  :deep(.fc-event) {
    cursor: pointer;
  }

  :deep(.fc-timegrid-col.fc-day-today),
  :deep(.fc-daygrid-day.fc-day-today) {
    background: transparent;
  }

  :deep(.event-calendar__event) {
    cursor: pointer;
    border: none;
  }

  :deep(.event-calendar__event--practice) {
    background: $accent;
  }

  :deep(.event-calendar__event--scrim) {
    background: $color-warn;
  }

  :deep(.event-calendar__event--match) {
    background: $color-loss;
  }

  :deep(.event-calendar__event--tournament) {
    background: $color-win;
  }
}
</style>
