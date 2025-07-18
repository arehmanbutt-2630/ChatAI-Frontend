import { useState, useEffect } from 'react';
import { Eye, EyeOff, MessageSquare, Bot } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from './authSlice';
import type { RootState, AppDispatch } from '../../app/store';

interface SignupPageProps {
  onSignup: () => void
  onSwitchToLogin: () => void
}

const SignupPage = (props: SignupPageProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      props.onSignup();
    }
  }, [auth.loading]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async (values) => {
      dispatch(signup({ username: values.username, email: values.email, password: values.password }));
    },
  })

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 flex flex-col text-white relative overflow-hidden min-h-[300px] md:min-h-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-white/15"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 rounded-full bg-white/10"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-12">
            <MessageSquare className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-wide">CHAT A.I+</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-bold leading-tight mb-8">
              Learn, Discover &<br />
              Automate in One Place.
            </h1>

            <div className="space-y-6 mb-8">
              <p className="text-lg opacity-90">
                Create a chatbot gpt using python language what will be step for that
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">GPT-4</span>
                </div>

                <p className="text-sm leading-relaxed mb-4">
                  Sure, I can help you get started with creating a chatbot using GPT in Python. Here are the basic steps you'll need to follow:
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">1</span>
                    <div>
                      <p><strong>Install the required libraries:</strong> You'll need to install the transformers library from Hugging Face to use GPT. You can install it using pip.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">2</span>
                    <div>
                      <p><strong>Load the pre-trained model:</strong> GPT comes in several sizes and versions, so you'll need to choose the one that fits your needs. You can load a pre-trained GPT model. This</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm mt-4 opacity-80">
                  These are just the basic steps to get started with a GPT chatbot in Python. Depending on your requirements, you may need to add more features or complexity to the chatbot. Good luck!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-8 flex flex-col justify-center min-h-[60vh] md:min-h-0 mx-auto md:mx-0">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h2>
            <p className="text-gray-600">Empower your experience, sign up for a free account today</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username*
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="ex: email@domain.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="text-xs text-gray-500">
              By registering for an account you are consenting to our{' '}
              <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and confirming that you have reviewed and accepted the{' '}
              <a href="#" className="text-indigo-600 hover:underline">Global Privacy Statement</a>.
            </div>

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {auth.loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Get started free'
              )}
            </button>
            {auth.error && <p className="text-sm text-red-500 mt-2 text-center">{auth.error}</p>}

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={props.onSwitchToLogin}
                className="text-indigo-600 hover:underline font-medium"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
