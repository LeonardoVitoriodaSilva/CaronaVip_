// src/components/CityAutocomplete.tsx
import React, { useState, useCallback } from 'react'
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, shadow } from '../theme'
import { tripService } from '../services/tripService'

interface Props {
  label: string
  value: string
  onSelect: (cidade: string) => void
  placeholder?: string
}

export function CityAutocomplete({ label, value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [aberto, setAberto] = useState(false)

  const buscar = useCallback(async (texto: string) => {
    setQuery(texto)
    if (texto.length < 2) { setSugestoes([]); return }
    const resultado = await tripService.cidades(texto)
    setSugestoes(resultado.slice(0, 8))
    setAberto(true)
  }, [])

  const selecionar = (cidade: string) => {
    setQuery(cidade)
    onSelect(cidade)
    setSugestoes([])
    setAberto(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={buscar}
        placeholder={placeholder || 'Digite a cidade...'}
        placeholderTextColor={colors.textTertiary}
        autoCorrect={false}
      />
      {aberto && sugestoes.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={sugestoes}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => selecionar(item)}>
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, zIndex: 100 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.beige, borderWidth: 1.5, borderColor: colors.beige3,
    borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 14, color: colors.text,
  },
  dropdown: {
    position: 'absolute', top: 78, left: 0, right: 0, backgroundColor: colors.white,
    borderRadius: radius.md, maxHeight: 220, ...shadow.md, zIndex: 999,
  },
  item: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.beige2 },
  itemText: { fontSize: 14, color: colors.navy, fontWeight: '500' },
})
