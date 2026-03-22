import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';

// Import services
import { authService, getLocalStorageItem, setLocalStorageItem, environment } from '../../services/auth';

// Import images
import thunaiLogo from '../../assets/images/branding/thunai-logo-light.png';
import loginImage from '../../assets/images/branding/login-img.svg';
import googleIcon from '../../assets/images/branding/Google.svg';
import HDLogo from '../../assets/images/branding/hd-supply.svg';
import LoginImage from '../../assets/images/branding/login-image.svg';
import AzureIcon from '../../assets/images/microsoft.svg';
/** 
 * ############################################################################
 * MAIN COMPONENT
 * ############################################################################
 */

export default function Login() {
  const navigate = useNavigate();
  
  // --- State ---
  const [view, setView] = useState<'login' | 'forgotPassword'>('login');
  const [forgotStep, setForgotStep] = useState<'OTP' | 'NEWPASSWORD'>('OTP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ emailVerified: false, passwordVerified: false });
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showTenantPopup, setShowTenantPopup] = useState(false);
  const [paymentLinkPopup, setPaymentLinkPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [loader_password, setLoader_password] = useState(false);
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPasswords, setNewPasswords] = useState({ p1: '', p2: '' });
  const [otpResent, setOtpResent] = useState(false);
  const [pwdHeader, setPwdHeader] = useState<'SET' | 'RESET'>('RESET');
  const version = '1.0.0'; // Replace with actual version
  
  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Cookie helpers
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Callback function to handle post-login flow
  const handleCallback = async (data: any) => {
    if (data?.password_reset) {
      setPwdHeader('SET');
      setView('forgotPassword');
      return;
    }

    const params = new URLSearchParams(data.uri.split('?')[1]);
    setRedirectLogin(true);
    const tenant_id = params.get('tenant_id');
    const code = params.get('code');

    try {
      const callbackData = await authService.callback(code!, tenant_id!, 'password');
      
      // Preserve csrf_token when storing user_info
      const existingData = getLocalStorageItem('user_info') || {};
      const dataToStore = {
        ...existingData,
        ...callbackData.data,
        csrf_token: callbackData.data.csrf_token || existingData.csrf_token,
        csrf_valid_until: callbackData.data.csrf_valid_until || existingData.csrf_valid_until
      };
      setLocalStorageItem('user_info', dataToStore);

      if (callbackData?.data?.subscription?.last_payment_link) {
        setPaymentLinkPopup(true);
      } else if (callbackData?.data) {
        // Check for utm_source cookie and redirect if it exists
        const utmSource = getCookie('utm_source');
        if (utmSource) {
          setTimeout(() => {
            window.location.href = utmSource;
          }, 1000);
          clearCookie('utm_source');
        } else {
          // Default navigation
          navigate('/meeting-feed/MeetingAssistants');
        }
      }
    } catch (error) {
      console.error('Callback error:', error);
      setRedirectLogin(false);
    }
  };

  // --- Handlers ---
  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!status.emailVerified) {
        const data = await authService.getTenants(email);
        setTenants(data);
        if (data.length === 1) {
          handleSelectTenant(data[0]);
        } else if (data.length > 1) {
          setShowTenantPopup(true);
        } else {
          alert('User not found');
        }
      } else {
        const payload = {
          emailId: email,
          password: password,
          redirectid: environment.redirectid,
          logout_redirect_id: environment.logout_redirect_id
        };
        const res = await authService.login('POST', payload, selectedTenant.tenant_id);
        if (res?.password_reset) {
          setPwdHeader(res.password_reset === 'SET' ? 'SET' : 'RESET');
          setView('forgotPassword');
        } else {
          // Success - Call callback function
          console.log("Login Success", res);
          await handleCallback(res);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTenant = async (tenant: any) => {
    setSelectedTenant(tenant);
    setLoading(true);
    try {
      const payload = { emailId: email, redirectid: environment.redirectid };
      const res = await authService.login('PUT', payload, tenant.tenant_id);
      if (res?.password_reset) {
        setPwdHeader(res.password_reset === 'SET' ? 'SET' : 'RESET');
        setView('forgotPassword');
      } else {
        // If login successful after tenant selection, call callback
        if (res?.uri) {
          await handleCallback(res);
        } else {
          setStatus(prev => ({ ...prev, emailVerified: true }));
          setShowTenantPopup(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoadingOtp(true);
    setOtpResent(false);
    try {
      await authService.managePassword('FORGET', selectedTenant.tenant_id, { emailId: email, message: 'forget' });
      setOtpResent(true);
      setTimeout(() => setOtpResent(false), 3000);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (newOtp.every(v => v !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      await authService.managePassword('RESET', selectedTenant.tenant_id, { otp: code, emailId: email });
      setForgotStep('NEWPASSWORD');
    } catch (err) {
      console.error('OTP verification failed', err);
    }
  };

  const handleSetPassword = async () => {
    if (!checkPasswordMatch() || !Object.values(validatePassword(newPasswords.p1)).slice(0, 5).every(Boolean)) {
      return;
    }
    try {
      setLoader_password(true);
      await authService.managePassword('UPDATE', selectedTenant.tenant_id, { 
        password: newPasswords.p1,
        emailId: email 
      });
      // Password reset successful - redirect to home
      navigate('/');
    } catch (err) {
      console.error('Password update failed', err);
    } finally {
      setLoader_password(false);
    }
  };

  const handleLoginWithGoogle = () => {
    // Implement Google OAuth login
    console.log('Google login triggered');
  };

  const handleLoginWithAzure = () => {
      const azureLoginUrl ='https://api.thunai.hdsupply.com/saml-service/saml/hds/login/692dbcd1a99bc515d02cd490/';
      window.location.href = azureLoginUrl;
  }

  const handleForgotPassword = () => {
    setView('forgotPassword');
    setForgotStep('OTP');
  };

  const navigateToLogin = () => {
    setView('login');
    setForgotStep('OTP');
    setOtp(['', '', '', '', '', '']);
    setNewPasswords({ p1: '', p2: '' });
  };

  // const navigateToSignup = () => {
  //   // Navigate to signup page
  //   console.log('Navigate to signup');
  // };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleOtpVisibility = () => {
    setShowOtp(prev => !prev);
  };

  const closeTenantPopup = () => {
    setShowTenantPopup(false);
  };

  const continueWithPayment = () => {
    // Handle payment flow
    console.log('Continue with payment');
    setPaymentLinkPopup(false);
  };

  const continueWithFreeTrial = () => {
    // Handle free trial flow
    console.log('Continue with free trial');
    setPaymentLinkPopup(false);
  };

  const validatePassword = (p: string) => ({
    minLength: p.length >= 8,
    hasCapitalCase: /[A-Z]/.test(p),
    hasSmallCase: /[a-z]/.test(p),
    hasNumber: /\d/.test(p),
    hasSpecialCharacters: /[!@#$%^&*]/.test(p),
  });

  const checkPasswordMatch = () => {
    return newPasswords.p1 === newPasswords.p2 && newPasswords.p1 !== '';
  };

  const pwdValid = validatePassword(newPasswords.p1);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Hidden on small/medium screens, visible on large screens */}
      <div className="hidden lg:flex w-full lg:w-[60%] bg-[#F9F3DC]">
        <div className="flex flex-col w-full h-full">
          {/* Logo aligned to top left */}
          {/* <img src={thunaiLogo} alt="Logo" className="w-[100px] md:w-[120px] mb-6" /> */}
      
          {/* Centered image and text */}
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <img src={LoginImage} alt="Welcome" className="max-w-full w-[60%] h-auto" />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[40%] p-6 sm:p-6 md:p-8 relative min-h-screen">
        {/* <img src={HDLogo} alt="Welcome" className="mt-10" /> */}

        {/* Form Content */}
        <div className="flex flex-col justify-center items-center w-full -mt-12 sm:-mt-16 md:-mt-20">
          {/* Login Form */}
                  <img src={HDLogo} alt="Welcome" className="mt-10" />

          {view === 'login' && !redirectLogin && (
            <div className="w-full p-6 sm:p-6 lg:p-10">
              <div className="max-w-md mx-auto p-8">
                {/* Header */}
                <div className="mb-8 md:mb-14">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 text-left mb-3">
                    Welcome Back!
                  </h1>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Email Field */}
                  {!status.emailVerified && (
                    <div>
                      <label className="block text-sm font-medium text-left text-gray-800 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="name@company.com"
                        className={`w-full px-4 py-3  text-sm sm:text-base rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                          email && !isValidEmail(email) ? 'border-red-500 ring-red-200' : 'border-gray-300'
                        }`}
                      />
                      {email && !isValidEmail(email) && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>Please enter a valid email</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Field */}
                  {status.emailVerified && (
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 mb-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <button
                          onClick={handleForgotPassword}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium text-left sm:text-right"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword.password ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                          maxLength={100}
                          placeholder="Enter your password"
                          className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                            password && !password ? 'border-red-500 ring-red-200' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('password')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                        >
                          {showPassword.password ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    onClick={handleLogin}
                    disabled={!status.emailVerified ? !isValidEmail(email) || loading : !password || loading}
                    className="w-full bg-[#FFC907] text-[#000000] py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition"
                  >
                    {loading && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="relative z-10">{loading ? 'Loading...' : 'Continue'}</span>
                    {!loading && (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  {/* Social Login */}
                  <div className="relative">
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* <button
                    onClick={handleLoginWithGoogle}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    <img src={googleIcon} alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-gray-700 font-medium">Continue with Google</span>
                  </button> */}

                   <button
                    onClick={handleLoginWithAzure}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    <img src={AzureIcon} alt="Azure" className="w-8 h-8" />
                    <span className="text-gray-700 font-medium">Continue with Azure</span>
                  </button>

                  {/* Sign Up Link */}
                  {/* {environment.isShowSignUp && (
                    <p className="text-center text-sm sm:text-base text-gray-600">
                      Don't have an account?
                      <button
                        onClick={navigateToSignup}
                        className="text-[#4056F4] hover:text-[#3345d9] font-medium ml-1"
                      >
                        Sign up
                      </button>
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Section */}
          {view === 'forgotPassword' && !redirectLogin && (
            <div className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-20">
              {/* OTP Step */}
              {forgotStep === 'OTP' && (
                <div className="w-full max-w-lg mx-auto mb-8 sm:mb-16">
                  <div className="text-center">
                    <div className="text-center mb-6 sm:mb-8">
                      <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                        {pwdHeader === 'SET' ? 'Set' : 'Reset'} Password
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        An OTP has been sent to your registered email.
                      </p>
                    </div>

                    <div className="flex items-center justify-center mb-6 sm:mb-8 gap-1 sm:gap-2">
                      <div className="flex gap-1 sm:gap-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            type={showOtp ? 'text' : 'password'}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, i)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={toggleOtpVisibility}
                        className="ml-1 sm:ml-2 cursor-pointer text-gray-600"
                      >
                        {showOtp ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-500">
                      <div className="flex flex-col">
                        <button
                          onClick={handleResendOtp}
                          disabled={loadingOtp}
                          className="hover:text-gray-800 cursor-pointer border border-gray-300 px-3 py-2 sm:px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
                        >
                          {loadingOtp && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {otpResent && !loadingOtp && (
                            <CheckCircle2 className="text-green-600 animate-scale-in" size={16} />
                          )}
                          {loadingOtp ? 'Sending OTP...' : 'Resend OTP'}
                        </button>
                        {otpResent && (
                          <span className="text-green-600 text-xs mt-1 animate-fade-in text-center sm:text-left">
                            OTP sent successfully!
                          </span>
                        )}
                      </div>
                      <button
                        onClick={navigateToLogin}
                        className="hover:text-gray-800 cursor-pointer border border-gray-300 px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Password Step */}
              {forgotStep === 'NEWPASSWORD' && (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="flex flex-col justify-center items-center w-full bg-gray-50 p-4 sm:p-6 rounded-lg relative">
                    {/* Heading */}
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {pwdHeader === 'SET' ? 'Set' : 'Reset'} Password
                    </h1>

                    {/* Subheading */}
                    <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 px-2">
                      Choose a password that's hard to guess and unique to this account.
                    </p>

                    {/* Password Input */}
                    <div className="w-full max-w-md mb-4 sm:mb-6 relative">
                      <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword.password ? 'text' : 'password'}
                          value={newPasswords.p1}
                          onChange={(e) => setNewPasswords({ ...newPasswords, p1: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your password"
                          maxLength={100}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('password')}
                          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                        >
                          {showPassword.password ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="w-full max-w-md mb-4 sm:mb-6">
                      <label htmlFor="confirm-password" className="block text-sm text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showPassword.confirmPassword ? 'text' : 'password'}
                          value={newPasswords.p2}
                          onChange={(e) => setNewPasswords({ ...newPasswords, p2: e.target.value })}
                          placeholder="Confirm your password"
                          maxLength={100}
                          className="w-full border border-gray-300 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                        >
                          {showPassword.confirmPassword ? <Eye size={18} className="sm:w-5 sm:h-5" /> : <EyeOff size={18} className="sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={handleSetPassword}
                      disabled={!checkPasswordMatch() || !Object.values(pwdValid).every(Boolean)}
                      className="w-full max-w-md py-2.5 sm:py-3 px-4 sm:px-6 bg-[#4056F4] text-white text-base sm:text-lg rounded-lg hover:bg-[#3345d9] active:bg-[#3345d9] transition-all duration-300 mb-3 sm:mb-4 shadow-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>

                    {/* Password Requirements */}
                    <div className="w-full flex flex-wrap max-w-md text-xs sm:text-sm text-gray-600">
                      {[
                        { key: 'minLength', text: 'Min 8 characters' },
                        { key: 'hasSmallCase', text: '1 Lowercase' },
                        { key: 'hasCapitalCase', text: '1 Uppercase' },
                        { key: 'hasNumber', text: '1 Number' },
                        { key: 'hasSpecialCharacters', text: '1 Special Character' }
                      ].map((requirement) => (
                        <div key={requirement.key} className="flex items-center mb-1.5 sm:mb-2 ml-1 sm:ml-2 w-1/2 sm:w-auto">
                          {pwdValid[requirement.key as keyof typeof pwdValid] ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-green-600" />
                          ) : (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 rounded-full border border-gray-400"></div>
                          )}
                          <span className="text-xs sm:text-sm">{requirement.text}</span>
                        </div>
                      ))}

                      <div className="flex items-center mb-1.5 sm:mb-2 ml-1 sm:ml-2 w-1/2 sm:w-auto">
                        {checkPasswordMatch() ? (
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-green-600" />
                        ) : (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 rounded-full border border-gray-400"></div>
                        )}
                        <span className="text-xs sm:text-sm">Passwords Match</span>
                      </div>
                    </div>

                    <div className="flex justify-start text-xs sm:text-sm text-gray-500 mt-2">
                      <button onClick={navigateToLogin} className="underline hover:text-gray-800 cursor-pointer">
                        Back to Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Redirect Login Section */}
          {(redirectLogin || loader_password) && (
            <div className="flex flex-col justify-center items-center mx-auto my-[20%]">
              <div className="flex flex-row items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-sm sm:text-base">Sit tight, almost there!</span>
              </div>
            </div>
          )}

          {/* Powered By and Footer Section */}
          {/* <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
            <div className="flex flex-col justify-center items-center">
              <span className="text-xs sm:text-sm md:text-base text-gray-500 mb-1">Secured By</span>
              <div className="flex items-center gap-1">
                <svg className="h-7 sm:h-8 lg:h-9 w-auto" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="10" y="20" fontSize="16" fontWeight="600" fill="#4056F4">Infisign</text>
                </svg>
              </div>
            </div>
          </div> */}
        </div>

        <footer className="text-center text-gray-500 py-3 sm:py-4 bottom-2 sm:bottom-4 absolute mb-2 sm:mb-3 min-[2500px]:mt-auto w-full px-4">
          <p className="mb-1 text-[10px] sm:text-xs">Version {version}</p>
          <p className="mb-1 text-[10px] sm:text-sm">&copy;2026 by HD Supply®. All Rights Reserved.</p>
          <div className="space-x-2 sm:space-x-4 text-[10px] sm:text-xs">
            <a
              href="https://hdsupplysolutions.com/s/terms_of_use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-primary transition-colors inline-block"            >
              Terms of Service
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://hdsupplysolutions.com/ns/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-primary transition-colors inline-block"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>

      {/* Tenant Selection Popup */}
      {showTenantPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white backdrop-blur-sm rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg md:text-xl text-gray-500 pr-2">
                Please select the organization to proceed further
              </h3>
              <button
                className="text-gray-500 hover:text-red-500 text-xl sm:text-2xl font-bold ml-2 sm:ml-4 flex-shrink-0"
                onClick={closeTenantPopup}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 max-h-60 sm:max-h-72 overflow-y-auto pr-1 sm:pr-2">
              {tenants.map((tenant) => (
                <li
                  key={tenant.tenant_id}
                  className="p-3 sm:p-4 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-300 capitalize transition-all duration-300 ease-in-out cursor-pointer text-xs sm:text-sm focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => handleSelectTenant(tenant)}
                >
                  {tenant.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Payment Link Popup */}
      {paymentLinkPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/98 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-2xl w-full max-w-sm sm:max-w-md mx-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Payment Options</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
              You have a pending payment. How would you like to proceed?
            </p>
            <div className="space-y-3 sm:space-y-4">
              <button
                className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium bg-gradient-to-r from-[#4056F4] to-[#8C5FE6] text-white shadow-lg hover:shadow-[#4056F4]/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8C5FE6] focus:ring-offset-2"
                onClick={continueWithPayment}
              >
                Continue with Payment
              </button>
              <button
                className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium bg-white text-[#4056F4] border border-[#4056F4] hover:bg-gray-50 transition-all duration-300 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8C5FE6] focus:ring-offset-2"
                onClick={continueWithFreeTrial}
              >
                Continue with Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
