import { useId, useMemo, useState } from "react"
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react"

export default function PasswordStrengthChecker() {
  const id = useId()
  const [password, setPassword] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ]
    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }))
  }

  const strength = checkStrength(password)

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length
  }, [strength])

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-gray-300"
    if (score <= 1) return "bg-red-500"
    if (score <= 2) return "bg-orange-500"
    if (score === 3) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password"
    if (score <= 2) return "Weak password"
    if (score === 3) return "Medium password"
    return "Strong password"
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <label htmlFor={id} className="text-white text-sm font-medium block mb-2">
        Password
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={`${id}-description`}
          className="bg-black border border-white border-opacity-30 text-white px-4 py-2 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-uiPrimary pr-10"
        />
        <button
          className="text-gray-400 hover:text-white absolute inset-y-0 right-2 flex items-center justify-center"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Strength Bar */}
      <div
        className="bg-gray-300 mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        ></div>
      </div>

      {/* Strength Description */}
      <p id={`${id}-description`} className="text-white mb-2 text-sm font-medium">
        {getStrengthText(strengthScore)}. Must contain:
      </p>

      {/* Requirements */}
      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon size={16} className="text-emerald-500" aria-hidden="true" />
            ) : (
              <XIcon size={16} className="text-gray-400" aria-hidden="true" />
            )}
            <span className={`text-xs ${req.met ? "text-emerald-400" : "text-gray-400"}`}>
              {req.text}
              <span className="sr-only">
                {req.met ? " - Requirement met" : " - Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
