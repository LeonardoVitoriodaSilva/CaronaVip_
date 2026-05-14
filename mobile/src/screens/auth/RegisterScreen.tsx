// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useDispatch } from 'react-redux'
import { authService } from '../../services/authService'
import { setUsuario } from '../../store/authSlice'
import { colors, radius, spacing } from '../../theme'
import api from '../../services/api'

export function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch()
  const [tipo, setTipo] = useState<'PASSAGEIRO' | 'MOTORISTA'>('PASSAGEIRO')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const criar = async () => {
    if (!nome || !email || !telefone || !senha) { Alert.alert('Atenção', 'Preencha todos os campos'); return }
    if (senha.length < 8) { Alert.alert('Atenção', 'Senha deve ter pelo menos 8 caracteres'); return }
    setCarregando(true)
    try {
      await authService.registrar({ nome, email: email.trim().toLowerCase(), telefone, senha, tipo })
      const { data } = await api.get('/users/me')
      dispatch(setUsuario(data.dados))
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.mensagem || 'Erro ao criar conta')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.content}>
      <View style={s.blob1} /><View style={s.blob2} />
      <View style={s.card}>
        <Text style={s.title}>Criar conta</Text>
        <Text style={s.sub}>Você é:</Text>

        <View style={s.roleRow}>
          {(['PASSAGEIRO', 'MOTORISTA'] as const).map((t) => (
            <TouchableOpacity key={t} style={[s.roleBtn, tipo === t && s.roleBtnOn]} onPress={() => setTipo(t)}>
              <Text style={s.roleIco}>{t === 'PASSAGEIRO' ? '🧍' : '🚗'}</Text>
              <Text style={[s.roleLbl, tipo === t && s.roleLblOn]}>{t === 'PASSAGEIRO' ? 'Passageiro' : 'Motorista'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={s.input} placeholder="Nome completo" placeholderTextColor={colors.textTertiary} value={nome} onChangeText={setNome} />
        <TextInput style={s.input} placeholder="E-mail" placeholderTextColor={colors.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Telefone (86) 99999-9999" placeholderTextColor={colors.textTertiary} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
        <TextInput style={s.input} placeholder="Senha (mínimo 8 caracteres)" placeholderTextColor={colors.textTertiary} value={senha} onChangeText={setSenha} secureTextEntry />

        <TouchableOpacity style={s.btn} onPress={criar} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Criar conta grátis</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.link}>Já tem conta? <Text style={{ color: colors.navy, fontWeight: '700' }}>Entrar</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.beige },
  content: { alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100%' },
  blob1: { position: 'absolute', top: -40, right: -30, width: '50%', height: '40%', backgroundColor: colors.orange, borderBottomLeftRadius: 999 },
  blob2: { position: 'absolute', bottom: -40, left: -30, width: '40%', height: '35%', backgroundColor: colors.navy, borderTopRightRadius: 999 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 32, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  title: { fontSize: 22, fontWeight: '800', color: colors.navy, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 14, borderWidth: 2, borderColor: colors.beige2, borderRadius: 16, alignItems: 'center' },
  roleBtnOn: { borderColor: colors.orange, backgroundColor: 'rgba(224,123,26,0.06)' },
  roleIco: { fontSize: 26, marginBottom: 6 },
  roleLbl: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  roleLblOn: { color: colors.orange },
  input: { backgroundColor: colors.beige, borderWidth: 1.5, borderColor: colors.beige3, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13, fontSize: 14, color: colors.text, marginBottom: 12 },
  btn: { backgroundColor: colors.black, borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  link: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
})
