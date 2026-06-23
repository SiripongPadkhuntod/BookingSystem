"use client";

import { useEffect, useState } from "react";

export type Language = "th" | "en";

const LANGUAGE_KEY = "bookingSystemLanguage";

export const dictionaries = {
  th: {
    appName: "RSU Booking",
    appSubtitle: "ระบบจองห้องและที่นั่ง",
    menu: "เมนู",
    logout: "ออกจากระบบ",
    logoutShort: "ออก",
    loading: "กำลังโหลด",
    dashboard: "จองที่นั่ง",
    reservations: "รายการจอง",
    settings: "ตั้งค่า",
    bookingKicker: "พื้นที่จอง",
    bookingTitle: "จองห้องและที่นั่ง",
    bookingDescription: "เลือกช่วงเวลาแล้วดูสถานะที่นั่งแบบเดียวกับระบบเดิม แต่จัดวางใหม่ให้อ่านง่ายขึ้น",
    chooseRoom: "เลือกห้อง",
    room: "ห้อง",
    date: "วันที่",
    start: "เริ่ม",
    end: "สิ้นสุด",
    seatMap: "แผนผังที่นั่ง",
    seatMapHint: "สีขาวคือว่าง สีเทาคือถูกจองแล้วในช่วงเวลาที่เลือก",
    bookingSummary: "สรุปการจอง",
    seat: "ที่นั่ง",
    noSeatSelected: "ยังไม่ได้เลือก",
    timeRange: "ช่วงเวลา",
    note: "หมายเหตุ",
    notePlaceholder: "เช่น ใช้ประชุมโปรเจกต์",
    selectSeatFirst: "กรุณาเลือกที่นั่งก่อนจอง",
    bookingSuccess: "จองสำเร็จ",
    bookingFailed: "ไม่สามารถจองได้",
    confirmBooking: "ยืนยันการจอง",
    bookingNow: "กำลังจอง...",
    loginTitle: "เข้าสู่ระบบ",
    loginDescription: "จัดการการจองห้องและที่นั่งของคุณด้วยบัญชี RSU",
    identifier: "อีเมลหรือชื่อผู้ใช้",
    password: "รหัสผ่าน",
    loginAction: "เข้าสู่ระบบ",
    loginLoading: "กำลังเข้าสู่ระบบ...",
    loginFailed: "เข้าสู่ระบบไม่สำเร็จ",
    noAccount: "ยังไม่มีบัญชี?",
    createAccount: "สร้างบัญชี",
    accountPrompt: "มีบัญชีแล้ว?",
    registerTitle: "สร้างบัญชี",
    registerDescription: "ใช้ข้อมูลบัญชี RSU เพื่อเริ่มต้นการจอง",
    username: "ชื่อผู้ใช้",
    email: "อีเมล RSU",
    firstName: "ชื่อ",
    lastName: "นามสกุล",
    studentId: "รหัสนักศึกษา",
    registerLoading: "กำลังสร้างบัญชี...",
    registerFailed: "สร้างบัญชีไม่สำเร็จ",
    loginVisualTitle: "ระบบจองที่นั่งแบบใหม่",
    loginVisualSubtitle: "ออกแบบเพื่อใช้งานซ้ำทุกวัน",
    loginVisualHeading: "เห็นภาพห้องก่อนจอง",
    loginVisualBody: "เลือกห้อง วันที่ เวลา และที่นั่งใน flow เดียว ลดความสับสนและป้องกันการจองซ้ำด้วย backend validation",
    myReservationsTitle: "รายการจองของฉัน",
    myReservationsDescription: "ติดตามและยกเลิกการจองที่ยังใช้งานอยู่",
    refresh: "โหลดใหม่",
    cancel: "ยกเลิก",
    cancelled: "ยกเลิกการจองแล้ว",
    cancelFailed: "ไม่สามารถยกเลิกได้",
    emptyReservations: "ยังไม่มีรายการจอง",
    time: "เวลา",
    manage: "จัดการ",
    accountSettingsTitle: "ตั้งค่าบัญชี",
    accountSettingsDescription: "ข้อมูลพื้นฐานและสถานะสิทธิ์ของผู้ใช้งาน",
    readinessTitle: "ความพร้อมสำหรับใช้งานจริง",
    jwtAuthentication: "ยืนยันตัวตนด้วย JWT",
    overlapProtection: "ป้องกันการจองซ้ำด้วย Postgres",
    roleReady: "รองรับสิทธิ์ผู้ใช้งาน",
    dockerCompose: "รันด้วย Docker Compose",
    typedApiClient: "Typed API client",
    responsiveNavigation: "เมนูรองรับทุกหน้าจอ"
  },
  en: {
    appName: "RSU Booking",
    appSubtitle: "Room and seat reservation",
    menu: "Menu",
    logout: "Log out",
    logoutShort: "Out",
    loading: "Loading",
    dashboard: "Book seat",
    reservations: "Reservations",
    settings: "Settings",
    bookingKicker: "Booking workspace",
    bookingTitle: "Book a room and seat",
    bookingDescription: "Pick a time slot and see seat availability in the same booking flow, redesigned for clearer scanning.",
    chooseRoom: "Choose room",
    room: "Room",
    date: "Date",
    start: "Start",
    end: "End",
    seatMap: "Seat map",
    seatMapHint: "White seats are available. Grey seats are already booked for the selected time.",
    bookingSummary: "Booking summary",
    seat: "Seat",
    noSeatSelected: "Not selected",
    timeRange: "Time range",
    note: "Note",
    notePlaceholder: "Example: project meeting",
    selectSeatFirst: "Please choose a seat before booking.",
    bookingSuccess: "Booking confirmed",
    bookingFailed: "Unable to book",
    confirmBooking: "Confirm booking",
    bookingNow: "Booking...",
    loginTitle: "Sign in",
    loginDescription: "Manage your room and seat reservations with your RSU account.",
    identifier: "Email or username",
    password: "Password",
    loginAction: "Sign in",
    loginLoading: "Signing in...",
    loginFailed: "Login failed",
    noAccount: "No account yet?",
    createAccount: "Create account",
    accountPrompt: "Already have an account?",
    registerTitle: "Create account",
    registerDescription: "Use your RSU account information to start booking.",
    username: "Username",
    email: "RSU email",
    firstName: "First name",
    lastName: "Last name",
    studentId: "Student ID",
    registerLoading: "Creating account...",
    registerFailed: "Registration failed",
    loginVisualTitle: "Modern seat booking",
    loginVisualSubtitle: "Designed for daily use",
    loginVisualHeading: "Preview the room before booking",
    loginVisualBody: "Choose room, date, time, and seat in one flow while backend validation prevents overlapping reservations.",
    myReservationsTitle: "My reservations",
    myReservationsDescription: "Track and cancel active bookings.",
    refresh: "Refresh",
    cancel: "Cancel",
    cancelled: "Reservation cancelled",
    cancelFailed: "Unable to cancel",
    emptyReservations: "No reservations yet",
    time: "Time",
    manage: "Manage",
    accountSettingsTitle: "Account settings",
    accountSettingsDescription: "Basic profile information and access status.",
    readinessTitle: "Production readiness",
    jwtAuthentication: "JWT authentication",
    overlapProtection: "Postgres overlap protection",
    roleReady: "Role-ready backend",
    dockerCompose: "Docker Compose",
    typedApiClient: "Typed API client",
    responsiveNavigation: "Responsive navigation"
  }
} as const;

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "th";
  return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "th";
}

export function setStoredLanguage(language: Language) {
  localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent<Language>("booking-language-change", { detail: language }));
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    setLanguageState(getStoredLanguage());
    const sync = () => setLanguageState(getStoredLanguage());
    const customSync = (event: Event) => setLanguageState((event as CustomEvent<Language>).detail);

    window.addEventListener("storage", sync);
    window.addEventListener("booking-language-change", customSync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("booking-language-change", customSync);
    };
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    setStoredLanguage(next);
  };

  return { language, setLanguage, t: dictionaries[language] };
}
