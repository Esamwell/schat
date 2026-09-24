<template>
  <q-layout class="vertical-center login-bg">
    <q-page-container>
      <q-page class="flex justify-center items-center">
        <q-ajax-bar
          position="top"
          color="white"
          size="5px"
        />
        <div class="login-card">
          <div class="login-card__header">
            <q-img
              :src="logoUrl"
              spinner-color="white"
              fit="contain"
              style="height: 48px; max-width: 280px"
              class="q-mb-md"
            />
            <div class="tw-text-2xl tw-font-bold login-card__title">Bem-vindo!</div>
            <div class="tw-text-sm login-card__subtitle">Faça login para continuar</div>
          </div>

          <div class="login-card__body">
            <div class="login-field">
              <div class="login-field__icon">
                <q-icon
                  name="mdi-email-outline"
                  size="20px"
                />
              </div>
              <input
                v-model="form.email"
                type="email"
                placeholder="meu@email.com"
                class="login-field__input"
                @blur="$v.form.email.$touch"
                @keypress.enter="fazerLogin"
              >
            </div>
            <div
              v-if="$v.form.email.$error"
              class="login-field__error"
            >Deve ser um e-mail válido.</div>

            <div class="login-field q-mt-md">
              <div class="login-field__icon">
                <q-icon
                  name="mdi-shield-key-outline"
                  size="20px"
                />
              </div>
              <input
                v-model="form.password"
                :type="isPwd ? 'password' : 'text'"
                placeholder="Senha"
                class="login-field__input"
                @blur="$v.form.password.$touch"
                @keypress.enter="fazerLogin"
              >
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                size="20px"
                class="login-field__toggle cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </div>
            <div
              v-if="$v.form.password.$error"
              class="login-field__error"
            >Informe sua senha.</div>

            <q-btn
              unelevated
              no-caps
              class="login-btn q-mt-lg full-width"
              :loading="loading"
              @click="fazerLogin"
            >
              Login
              <span slot="loading">
                <q-spinner-puff class="on-left" />Logando...
              </span>
            </q-btn>
          </div>

          <q-inner-loading :showing="loading" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { ListarLogoPublica } from 'src/service/configuracoes'

export default {
  name: 'Login',
  data () {
    return {
      modalEsqueciSenha: false,
      emailRedefinicao: null,
      form: {
        email: null,
        password: null
      },
      contasCliente: {},
      isPwd: true,
      loading: false,
      logoUrl: '/izing-logo_5_transparent.png'
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    },
    emailRedefinicao: { required, email }
  },
  methods: {
    fazerLogin () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Informe usuário e senha corretamente.')
        return
      }
      this.loading = true
      this.$store.dispatch('UserLogin', this.form)
        .then(data => {
          this.loading = false
        })
        .catch(err => {
          console.error('exStore', err)
          this.loading = false
        })
    },
    clear () {
      this.form.email = ''
      this.form.password = ''
      this.$v.form.$reset()
    }
  },
  mounted () {
    ListarLogoPublica()
      .then(({ data }) => {
        if (data && data.logoLightUrl) {
          this.logoUrl = `${process.env.VUE_URL_API}${data.logoLightUrl}`
        }
      })
      .catch(() => {})
  }
}
</script>
<style scoped>
.login-bg {
  background: linear-gradient(135deg, #E10628 0%, #F08000 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px -12px rgba(30, 20, 90, 0.45);
  background: #fff;
}

.login-card__header {
  background: #fff;
  padding: 40px 32px 32px;
  text-align: center;
  border-bottom: 1px solid hsl(37 20% 88%);
}

.login-card__title {
  color: #E10628;
}

.login-card__subtitle {
  color: #E10628;
  opacity: 0.75;
}

.login-card__body {
  padding: 32px;
}

.login-field {
  display: flex;
  align-items: center;
  border: 1px solid hsl(214 32% 91%);
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
  transition: border-color .15s ease;
}

.login-field:focus-within {
  border-color: #E10628;
}

.login-field__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: hsl(351 95% 45% / .08);
  color: #E10628;
}

.login-field__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 14px;
  font-size: 14px;
  font-family: inherit;
  color: hsl(222 47% 11%);
  min-width: 0;
}

.login-field__toggle {
  margin-right: 14px;
  color: hsl(215 16% 47%);
}

.login-field__error {
  color: #DC2626;
  font-size: 12px;
  padding: 4px 14px 0;
}

.login-btn {
  background: linear-gradient(135deg, #E10628, #F08000);
  color: #fff;
  border-radius: 999px;
  height: 46px;
  font-weight: 600;
}

body.body--dark .login-card {
  background: #0A0A0A;
}

body.body--dark .login-field {
  border-color: #262626;
  background: #0A0A0A;
}

body.body--dark .login-field__input {
  color: #F5F5F5;
}
</style>
