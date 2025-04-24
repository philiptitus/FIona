"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import Cookies from "js-cookie"
import { loginSuccess } from "@/store/slices/authSlice"

export default function AuthHydrator() {
  const dispatch = useDispatch()
  useEffect(() => {
    const token = Cookies.get("token")
    const refreshToken = Cookies.get("refreshToken")
    const user = localStorage.getItem("user")
    if (token && user) {
      dispatch(loginSuccess({ user: JSON.parse(user), token, refreshToken }))
    }
  }, [dispatch])
  return null
}
