import { Router } from 'express'
import { authService } from '@/services'

const router: Router = Router()

router.post('/register', authService.registerUser)
// router.get('/login', authController.login);
// router.get('/logout', authController.logout);

export default router
