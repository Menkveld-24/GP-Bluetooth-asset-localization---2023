import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { userStore } from '@stores/userStore';

const authCheck = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const user = userStore();
    await user.init();

    if (user.user.authenticated) {
        if (to.name === 'Login') {
            return next({ name: 'Home' });
        }
        return next();
    } else if (to.name === 'Login') {
        return next();
    }

    return next({ name: 'Login' });
};

export default authCheck;
