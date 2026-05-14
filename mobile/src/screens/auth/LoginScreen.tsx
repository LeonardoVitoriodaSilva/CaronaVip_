// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import { authService } from '../../services/authService'
import { setUsuario } from '../../store/authSlice'
import { colors, radius, spacing } from '../../theme'
import api from '../../services/api'

export function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const entrar = async () => {
    if (!email || !senha) { Alert.alert('Atenção', 'Preencha e-mail e senha'); return }
    setCarregando(true)
    try {
      const dados = await authService.login(email.trim().toLowerCase(), senha)
      const { data } = await api.get('/users/me')
      dispatch(setUsuario(data.dados))
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.mensagem || 'E-mail ou senha incorretos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.bg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Background blobs */}
      <View style={s.blob1} /><View style={s.blob2} />

      <View style={s.card}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>CARONA</Text>
          <Text style={s.logoVip}>VIP</Text>
        </View>
        <Text style={s.title}>Login Carona VIP</Text>
        <Text style={s.sub}>Mobilidade entre cidades do Piauí</Text>

        <TextInput style={s.input} placeholder="E-mail" placeholderTextColor={colors.textTertiary}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <TextInput style={s.input} placeholder="Senha" placeholderTextColor={colors.textTertiary}
          value={senha} onChangeText={setSenha} secureTextEntry />

        <TouchableOpacity style={s.btn} onPress={entrar} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>Não tem conta? <Text style={{ color: colors.navy, fontWeight: '700' }}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.beige, alignItems: 'center', justifyContent: 'center' },
  blob1: { position: 'absolute', top: -40, right: -30, width: '50%', height: '60%', backgroundColor: colors.orange, borderBottomLeftRadius: 999 },
  blob2: { position: 'absolute', bottom: -40, left: -30, width: '40%', height: '50%', backgroundColor: colors.navy, borderTopRightRadius: 999 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 36, width: '88%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  logoBox: { backgroundColor: colors.navy, borderRadius: 18, width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { color: colors.white, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  logoVip: { color: colors.orange, fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textTertiary, marginBottom: 24 },
  input: { width: '100%', backgroundColor: colors.beige, borderWidth: 1.5, borderColor: colors.beige3, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13, fontSize: 14, color: colors.text, marginBottom: 12 },
  btn: { width: '100%', backgroundColor: colors.black, borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  link: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
})
