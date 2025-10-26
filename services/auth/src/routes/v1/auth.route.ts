import { Router } from 'express'
import { authService } from '@/services'

const router: Router = Router()

router.post('/register', authService.registerUser)
router.get('/verify-email', authService.verifyEmail)
router.post('/verify-email', authService.verifyEmail)
// router.post('/resend-verification-email', authService.resendVerificationEmail)
// router.get('/login', authController.login);
// router.get('/logout', authController.logout);

export default router
