import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/auth-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Eye, EyeOff } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<'admin' | 'institution' | 'individual'>('individual')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password, confirmPassword, role)
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again."
      
      try {
        // Try to parse the error message as JSON in case it contains detailed errors
        const errorData = JSON.parse(err.message)
        if (typeof errorData === 'object') {
          // Format validation errors
          errorMessage = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
        } else {
          errorMessage = err.message
        }
      } catch {
        // If parsing fails, use the original error message
        errorMessage = err.message || errorMessage
      }
      
      setError(errorMessage)
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      {/* Background Image - Full screen on all devices */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/6347738/pexels-photo-6347738.jpeg"
          alt="Cheerful woman with donation box"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#37b7ff]/30 to-sky-900/40 backdrop-blur-sm"></div>
      </div>

      {/* Centered Registration Box */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 p-8 transform transition-all"
             style={{ boxShadow: '0 10px 25px -5px rgba(55, 183, 255, 0.1), 0 8px 10px -6px rgba(55, 183, 255, 0.1)' }}>
          {/* Quote on top of the registration box */}
          <div className="mb-6 text-center">
            <div className="bg-cyan-50 rounded-lg p-4 mb-6 border-l-4 border-[#37b7ff] shadow-sm">
              <p className="text-[#37b7ff] text-sm italic">
                "Join our community and be part of the change - Create positive impact with WaltergateFund."
              </p>
            </div>
          </div>
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#37b7ff] to-sky-600 shadow-lg border-4 border-white">
              <img
                src="/images/wgg.png"
                alt="WaltergateFund Logo"
                className="h-14 w-14 object-contain"
              />
            </div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold tracking-tight bg-gradient-to-r from-[#37b7ff] to-sky-600 bg-clip-text text-transparent">Create an Account</h1>
          <p className="mb-8 text-center text-gray-600">Join WaltergateFund today</p>

          {/* Social login buttons */}
         {/*<div className="mb-6 grid grid-cols-3 gap-3">
            <Button variant="outline" className="w-full hover:bg-sky-50 hover:border-[#37b7ff] transition-colors shadow-sm">
              <Facebook className="h-5 w-5 text-[#37b7ff]" />
            </Button>
            <Button variant="outline" className="w-full hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
              <FcGoogle className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="w-full hover:bg-sky-50 hover:border-[#37b7ff] transition-colors shadow-sm">
              <Linkedin className="h-5 w-5 text-[#37b7ff]" />
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">Or register with email</span>
            </div>
          </div>*/}

          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 shadow-sm whitespace-pre-line">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-semibold text-gray-700">
                Account Type
              </label>
              <Select value={role} onValueChange={(value: 'admin' | 'institution' | 'individual') => setRole(value)}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#37b7ff]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#37b7ff]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(!!checked)} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-[#37b7ff] hover:text-sky-500 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#37b7ff] hover:text-sky-500 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#37b7ff] to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-semibold shadow-lg transform transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[#37b7ff] hover:text-sky-500 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}