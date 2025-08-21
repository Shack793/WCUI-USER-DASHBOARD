import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/auth-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log('🔑 Login form submitted with:', { email, password: '[HIDDEN]' })

    try {
      await login(email, password)
      console.log('🔑 Login successful!')
    } catch (err: any) {
      console.error('🔑 Login failed:', err)
      console.error('🔑 Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      
      let errorMessage = "Failed to login. Please check your credentials."
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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

      {/* Centered Login Box */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 p-8 transform transition-all"
             style={{ boxShadow: '0 10px 25px -5px rgba(55, 183, 255, 0.1), 0 8px 10px -6px rgba(55, 183, 255, 0.1)' }}>
          {/* Quote on top of the login box */}
          <div className="mb-6 text-center">
            <div className="bg-cyan-50 rounded-lg p-4 mb-6 border-l-4 border-[#37b7ff] shadow-sm">
                <p className="text-[#37b7ff] text-sm italic">
                "Making a difference together - Join thousands creating positive change worldwide."
                </p>
            </div>
          </div>
            <div className="mb-6 flex items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg border-4 border-gray-200">
              <img
              src="/images/myeasydonate-voted-logo-cropped.png"              alt="MyEasyDonate Logo"
              className="h-80 w-80 object-contain font-black transform scale-110"
              onError={(e) => {
                console.error("Logo image failed to load:", e);
                (e.target as HTMLImageElement).src = "/images/myeasydonate-voted-logo-cropped.png";
              }}
              />
            </div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold tracking-tight bg-gradient-to-r from-[#37b7ff] to-sky-600 bg-clip-text text-transparent">Welcome back</h1>
            <p className="mb-8 text-center text-gray-600">Sign in to your MyEasyDonate account</p>

          {/* Social login buttons */}
         {/*iv className="mb-6 grid grid-cols-3 gap-3">
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
              <span className="bg-white px-4 text-gray-500 font-medium">Or sign in with email</span>
            </div>
          </div>*/}

          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 shadow-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#37b7ff] hover:text-sky-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-300 focus:border-[#37b7ff] focus:ring-[#37b7ff] shadow-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#37b7ff] to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-semibold shadow-lg transform transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#37b7ff] hover:text-sky-500 hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}