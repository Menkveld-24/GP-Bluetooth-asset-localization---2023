<template>
    <div class="h-screen relative">
        <div class="h-1/6 md:h-1/4"></div>
        <div class="text-right text-white max-w-none md:max-w-5xl">
            <div class="w-fit md:ml-auto ml-2">
                <div class="text-7xl md:text-8xl">Unimatrix 52</div>
                <div class="text-left">A Bluetooth asset localization system</div>
                <router-link :to="{ name: 'Live' }">
                    <div
                        class="hover:bg-sky-700 hover:cursor-pointer text-left bg-sky-800 w-1/6 rounded-md py-1 px-2 shadow-md text-sm hover:w-full transform transition-all duration-500"
                    >
                        Dashboard
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>
