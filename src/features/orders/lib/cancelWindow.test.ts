import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '../types';
import { CANCEL_WINDOW_HOURS, canCancel, hoursLeftToCancel } from './cancelWindow';

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-10-01T12:00:00.000Z');

function orderPlaced(hoursAgo: number, status: Order['status'] = 'placed') {
  return { createdAt: new Date(Date.now() - hoursAgo * HOUR).toISOString(), status };
}

describe('cancelWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses a 48 hour window', () => {
    expect(CANCEL_WINDOW_HOURS).toBe(48);
  });

  it('allows cancelling inside the window (default now)', () => {
    const order = orderPlaced(2);
    expect(canCancel(order)).toBe(true);
    expect(hoursLeftToCancel(order)).toBe(46);
  });

  it('rounds the hours left up', () => {
    const order = orderPlaced(2.5);
    expect(hoursLeftToCancel(order, new Date())).toBe(46);
    vi.advanceTimersByTime(45 * HOUR + 29 * 60 * 1000);
    // 47 h 59 min elapsed: one minute left still shows 1 h
    expect(canCancel(order)).toBe(true);
    expect(hoursLeftToCancel(order)).toBe(1);
  });

  it('is not cancellable at exactly 48 h', () => {
    const order = orderPlaced(0);
    vi.advanceTimersByTime(CANCEL_WINDOW_HOURS * HOUR - 1);
    expect(canCancel(order)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(canCancel(order)).toBe(false);
    expect(hoursLeftToCancel(order)).toBe(0);
  });

  it('is not cancellable after the window', () => {
    const order = orderPlaced(240);
    expect(canCancel(order)).toBe(false);
    expect(hoursLeftToCancel(order)).toBe(0);
  });

  it('treats a future createdAt as just placed', () => {
    const order = orderPlaced(-5);
    expect(canCancel(order)).toBe(true);
    expect(hoursLeftToCancel(order)).toBe(48);
  });

  it('is not cancellable once a cancellation was requested', () => {
    const order = orderPlaced(1, 'cancellation_requested');
    expect(canCancel(order)).toBe(false);
    expect(hoursLeftToCancel(order)).toBe(0);
  });

  it('accepts an explicit now', () => {
    const order = orderPlaced(0);
    expect(canCancel(order, new Date(NOW.getTime() + 50 * HOUR))).toBe(false);
    expect(hoursLeftToCancel(order, new Date(NOW.getTime() + 47 * HOUR))).toBe(1);
  });
});
