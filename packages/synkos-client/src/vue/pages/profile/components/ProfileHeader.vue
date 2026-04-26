<template>
  <div class="profile-header">
    <div class="avatar-wrap">
      <div class="avatar">
        <img v-if="avatar" :src="avatar" class="avatar-img" />
        <q-icon v-else name="person" size="44px" color="white" />
      </div>
    </div>

    <h1 class="profile-name">
      {{ displayName ?? t('pages.profile.guestName') }}
    </h1>
    <p class="profile-sub">
      {{ isAuthenticated ? email : t('pages.profile.guestSubtitle') }}
    </p>

    <button v-if="!isAuthenticated" class="sign-in-btn" @click="$emit('signIn')">
      {{ t('pages.profile.signIn') }}
    </button>

    <div v-if="isAuthenticated && providers?.length" class="provider-badges">
      <span v-for="p in providers" :key="p" class="provider-badge">
        <q-icon
          :name="p === 'google' ? 'g_mobiledata' : p === 'apple' ? 'apple' : 'email'"
          size="13px"
        />
        {{ p }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  avatar?: string | undefined;
  displayName?: string | undefined;
  email?: string | undefined;
  isAuthenticated: boolean;
  providers?: string[] | undefined;
}

defineProps<Props>();
defineEmits<{ signIn: [] }>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-16 $space-12 $space-12;
  text-align: center;
}

.avatar-wrap {
  margin-bottom: $space-8;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 44px;
  background: linear-gradient(135deg, #1c1c2e 0%, #2c2c3e 100%);
  border: 0.5px solid $border-strong;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 45px;
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.4), rgba(48, 209, 88, 0.2));
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    padding: 1px;
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: $font-title;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.4px;
  margin: 0 0 $space-3 0;
}

.profile-sub {
  font-size: 14px;
  color: $text-label;
  margin: 0 0 $space-8 0;
  line-height: $lh-base;
}

.sign-in-btn {
  font-size: $font-body;
  font-weight: 600;
  color: $primary;
  background: rgba(10, 132, 255, 0.12);
  border: 0.5px solid rgba(10, 132, 255, 0.25);
  border-radius: $radius-full;
  padding: $space-4 $space-12;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: $ls-normal;
  transition: opacity $transition-quick;

  &:active {
    opacity: 0.7;
  }
}

.provider-badges {
  display: flex;
  gap: $space-4;
  flex-wrap: wrap;
  justify-content: center;
}

.provider-badge {
  display: flex;
  align-items: center;
  gap: $space-2;
  background: $separator;
  border: 0.5px solid $border-medium;
  border-radius: $radius-full;
  padding: $space-2 $space-5;
  font-size: $font-caption;
  color: rgba(235, 235, 245, 0.5);
  text-transform: capitalize;
}
</style>
