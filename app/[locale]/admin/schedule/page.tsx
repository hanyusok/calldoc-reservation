'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import { getGlobalSchedule, updateWeeklySchedule, setDayOverride, clearDayOverride, getSchedule } from '@/app/actions/schedule';
import { ChevronLeft, ChevronRight, Save, Clock, Calendar as CalendarIcon, X } from 'lucide-react';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function AdminSchedulePage() {
    const t = useTranslations('Admin.schedule');
    const [loading, setLoading] = useState(true);
    const [weeklySchedule, setWeeklySchedule] = useState<any>({});
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [daySchedule, setDaySchedule] = useState<any>(null); // { isDayOff, availableSlots }

    useEffect(() => {
        loadGlobal();
    }, []);

    useEffect(() => {
        if (selectedDate) loadDay(selectedDate);
    }, [selectedDate]);

    async function loadGlobal() {
        const sched = await getGlobalSchedule();
        setWeeklySchedule(sched || {});
        setLoading(false);
    }

    async function loadDay(date: Date) {
        const data = await getSchedule(date);
        // data.override is what we care about for "Editing" the day
        if (data.override) {
            setDaySchedule({
                isDayOff: data.override.isDayOff,
                // availableSlots: data.override.availableSlots ? JSON.parse(data.override.availableSlots as string) : null 
            });
        } else {
            // Default state for this day based on weekly?
            // Or just empty state implying "Standard".
            setDaySchedule(null);
        }
    }

    async function saveWeekly() {
        setLoading(true);
        await updateWeeklySchedule(weeklySchedule);
        alert(t('saved'));
        setLoading(false);
    }

    async function saveDayOverride(isOff: boolean) {
        if (!selectedDate) return;
        setLoading(true);
        await setDayOverride(selectedDate, isOff);
        await loadDay(selectedDate);
        setLoading(false);
    }

    async function clearDay() {
        if (!selectedDate) return;
        setLoading(true);
        await clearDayOverride(selectedDate);
        setDaySchedule(null);
        setLoading(false);
    }

    const handleWeeklyChange = (day: string, field: string, value: any) => {
        setWeeklySchedule((prev: any) => {
            const currentDay = prev[day] || {};
            // If toggling "Enabled" (i.e. not null)
            if (field === 'enabled') {
                if (value) {
                    return { ...prev, [day]: { start: '10:00', end: '18:00', break: ['12:00', '12:30'] } };
                } else {
                    return { ...prev, [day]: null };
                }
            }
            // Updating fields
            return {
                ...prev,
                [day]: { ...currentDay, [field]: value }
            };
        });
    };

    // Calendar Grid
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    return (
        <div className="p-6 max-w-full mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <h1 className="text-2xl font-bold col-span-full">{t('title')}</h1>

            {/* Weekly Schedule Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {t('weeklyTitle')}
                    </h2>
                    <button
                        onClick={saveWeekly}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4 mr-2" /> {t('saveWeekly')}
                    </button>
                </div>

                <div className="space-y-4">
                    {DAYS.map((day) => {
                        const config = weeklySchedule[day];
                        const isEnabled = config !== null && config !== undefined; // If explicit null, it's OFF. 

                        // Special default for empty state: Tue/Wed OFF
                        // But here we rely on state.

                        return (
                            <div key={day} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <div className="w-24 font-medium uppercase">{day}</div>
                                    <label className="flex items-center space-x-2 sm:hidden">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={(e) => handleWeeklyChange(day, 'enabled', e.target.checked)}
                                            className="rounded text-blue-600 w-5 h-5"
                                        />
                                        <span className="text-sm text-gray-600">{isEnabled ? 'Working' : 'Off Duty'}</span>
                                    </label>
                                </div>

                                <label className="hidden sm:flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={(e) => handleWeeklyChange(day, 'enabled', e.target.checked)}
                                        className="rounded text-blue-600 w-5 h-5"
                                    />
                                    <span className="text-sm text-gray-600 min-w-[70px]">{isEnabled ? 'Working' : 'Off Duty'}</span>
                                </label>

                                {isEnabled && (
                                    <div className="flex flex-wrap items-center gap-3 sm:ml-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">Start</span>
                                            <input
                                                type="time"
                                                value={config.start}
                                                onChange={(e) => handleWeeklyChange(day, 'start', e.target.value)}
                                                className="border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">End</span>
                                            <input
                                                type="time"
                                                value={config.end}
                                                onChange={(e) => handleWeeklyChange(day, 'end', e.target.value)}
                                                className="border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Calendar Override Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold flex items-center mb-6">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    {t('specificDateTitle')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></button>
                            <span className="font-bold text-lg">{format(currentMonth, 'yyyy MMMM')}</span>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(d => <div key={d} className="font-medium text-gray-500">{t(`days.${d}`)}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {daysInMonth.map(d => {
                                const isSelected = selectedDate && isSameDay(d, selectedDate);
                                return (
                                    <button
                                        key={d.toISOString()}
                                        onClick={() => setSelectedDate(d)}
                                        className={`
                                            p-2 rounded-lg aspect-square flex items-center justify-center relative
                                            ${!isSameMonth(d, currentMonth) ? 'text-gray-300' : ''}
                                            ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                                        `}
                                    >
                                        {format(d, 'd')}
                                        {/* TODO: Indicator if override exists */}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editor Side */}
                    <div className="border-l pl-8">
                        {selectedDate ? (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold">{format(selectedDate, 'PPP', { locale: ko })}</h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">Status</span>
                                            {daySchedule ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">Override Active</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">Standard Schedule</span>
                                            )}
                                        </div>

                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                onClick={() => saveDayOverride(true)}
                                                className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${daySchedule?.isDayOff ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-red-50'}`}
                                            >
                                                Mark as Off Duty
                                            </button>
                                            <button
                                                onClick={() => saveDayOverride(false)}
                                                className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${daySchedule && !daySchedule.isDayOff ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-green-50'}`}
                                            >
                                                Mark as Working
                                            </button>
                                        </div>
                                    </div>

                                    {daySchedule && (
                                        <button
                                            onClick={clearDay}
                                            className="w-full py-2 text-gray-500 hover:text-red-500 text-sm flex items-center justify-center border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reset to Weekly Schedule
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Select a date to manage availability</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
