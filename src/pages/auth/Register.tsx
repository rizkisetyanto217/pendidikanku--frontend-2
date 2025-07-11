// src/pages/Register.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '@/layout/AuthLayout'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'

const securityQuestions = [
  'Sebutkan nama orang',
  'Sebutkan istilah dalam islam',
  'Sebutkan sesuatu hal tentang dirimu'
]

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    security_question: '',
    security_answer: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { isDark } = useHtmlDarkMode()
  const themeColors = isDark ? colors.dark : colors.light

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await axios.post(
        'https://masjidkubackend4-production.up.railway.app/auth/register',
        formData
      )

      if (response.data.status === 'success') {
        setSuccess('Registrasi berhasil! Silakan login.')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError('Registrasi gagal, coba lagi.')
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Registrasi gagal.')
      } else {
        setError('Terjadi kesalahan saat mendaftar.')
      }
    } finally {
      setLoading(false)
    }
  }

  const { user_name, email, password, security_question, security_answer } = formData

  const inputStyle = `w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2`
  const ringColor = `focus:ring-[${themeColors.primary}]`
  const borderColor = `border-[${themeColors.silver1}]`
  const bgColor = themeColors.white1
  const textColor = themeColors.black1

  return (
<AuthLayout mode="register">
  <form onSubmit={handleSubmit}>
    {/* Username, Email, Password */}
    {[
      { id: 'user_name', label: 'Username', value: user_name, type: 'text' },
      { id: 'email', label: 'Email', value: email, type: 'email' },
      { id: 'password', label: 'Password', value: password, type: 'password' },
    ].map((field) => (
      <div className="mb-4" key={field.id}>
        <label htmlFor={field.id} className="block text-sm" style={{ color: themeColors.silver2 }}>
          {field.label}
        </label>
        <input
          type={field.type}
          id={field.id}
          name={field.id}
          value={field.value}
          onChange={handleChange}
          required
          className={`${inputStyle} ${ringColor}`}
          style={{ backgroundColor: bgColor, color: textColor, borderColor: themeColors.silver1 }}
        />
      </div>
    ))}

    {/* Pertanyaan Keamanan */}
    <div className="mb-4">
      <label htmlFor="security_question" className="block text-sm" style={{ color: themeColors.silver2 }}>
        Pertanyaan Keamanan
      </label>
      <select
        id="security_question"
        name="security_question"
        value={security_question}
        onChange={handleChange}
        required
        className={`${inputStyle} ${ringColor}`}
        style={{ backgroundColor: bgColor, color: textColor, borderColor: themeColors.silver1 }}
      >
        <option value="">Pilih pertanyaan...</option>
        {securityQuestions.map((q) => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>
    </div>

    {/* Jawaban Keamanan */}
    <div className="mb-4">
      <label htmlFor="security_answer" className="block text-sm" style={{ color: themeColors.silver2 }}>
        Jawaban Keamanan
      </label>
      <input
        type="text"
        id="security_answer"
        name="security_answer"
        value={security_answer}
        onChange={handleChange}
        required
        className={`${inputStyle} ${ringColor}`}
        style={{ backgroundColor: bgColor, color: textColor, borderColor: themeColors.silver1 }}
      />
    </div>

    {/* Feedback */}
    {error && <div className="mb-4 text-sm" style={{ color: themeColors.error1 }}>{error}</div>}
    {success && <div className="mb-4 text-sm" style={{ color: themeColors.success1 }}>{success}</div>}

    {/* Tombol Submit */}
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 text-white rounded-lg focus:outline-none transition"
      style={{
        backgroundColor: loading ? themeColors.primary2 : themeColors.primary,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Mendaftar...' : 'Daftar'}
    </button>
  </form>
</AuthLayout>

  )
}
