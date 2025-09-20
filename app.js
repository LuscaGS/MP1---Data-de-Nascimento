import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from "react-native";

function daysInMonth(year, month1to12) {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

function isValidDateBR(d, m, y) {
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return false;
  if (y < 1900 || y > 9999) return false;
  if (m < 1 || m > 12) return false;
  const dim = daysInMonth(y, m);
  if (d < 1 || d > dim) return false;
  return true;
}

function parseDateBR(str) {
  const m = str.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (!isValidDateBR(d, mo, y)) return null;
  return new Date(Date.UTC(y, mo - 1, d));
}

function toUTCDateOnly(dateLike) {
  const y = dateLike.getUTCFullYear();
  const m0 = dateLike.getUTCMonth();
  const d = dateLike.getUTCDate();
  return new Date(Date.UTC(y, m0, d));
}

function diffYMD(fromBirthUTC, toTodayUTC) {
  let y = toTodayUTC.getUTCFullYear() - fromBirthUTC.getUTCFullYear();
  let m = toTodayUTC.getUTCMonth() + 1 - (fromBirthUTC.getUTCMonth() + 1);
  let d = toTodayUTC.getUTCDate() - fromBirthUTC.getUTCDate();

  if (d < 0) {
    m -= 1;
    let borrowMonth = toTodayUTC.getUTCMonth();
    let borrowYear = toTodayUTC.getUTCFullYear();
    if (borrowMonth === 0) {
      borrowMonth = 12;
      borrowYear -= 1;
    }
    const dim = daysInMonth(
      borrowYear,
      borrowMonth === 12 ? 12 : borrowMonth
    );
    d += dim;
  }

  if (m < 0) {
    y -= 1;
    m += 12;
  }

  return { years: y, months: m, days: d };
}

function faixaEtaria(years) {
  if (years <= 19) return "Jovem";
  if (years <= 59) return "Adulto";
  return "Idoso";
}

export default function App() {
  const [nascimento, setNascimento] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const handleCalcular = () => {
    setErro("");
    setResultado(null);

    const birth = parseDateBR(nascimento);
    if (!birth) {
      setErro("Digite uma data válida no formato dd/mm/aaaa.");
      return;
    }

    const now = new Date();
    const todayUTC = toUTCDateOnly(now);
    const birthUTC = toUTCDateOnly(birth);

    if (birthUTC > todayUTC) {
      setErro("A data de nascimento não pode ser futura.");
      return;
    }

    const { years, months, days } = diffYMD(birthUTC, todayUTC);
    setResultado({
      years,
      months,
      days,
      label: faixaEtaria(years),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Data de Nascimento:</Text>
        <Text style={styles.subtitle}>
          Digite sua data de nascimento (dd/mm/aaaa) e calcule sua idade exata:
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Data de Nascimento:</Text>
          <TextInput
            placeholder="dd/mm/aaaa"
            value={nascimento}
            onChangeText={setNascimento}
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
          />

          {!!erro && <Text style={styles.error}>{erro}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleCalcular}>
            <Text style={styles.buttonText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        {resultado && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado:</Text>
            <Text style={styles.resultLine}>
              <Text style={styles.bold}>Idade:</Text>{" "}
              {resultado.years} ano(s), {resultado.months} mês(es) e {resultado.days} dia(s)
            </Text>
            <Text style={styles.resultLine}>
              <Text style={styles.bold}>Faixa etária:</Text> {resultado.label}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#5DE2E7" },
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 38,
    fontWeight: "700",
    marginTop: 12,
    color: "#F2F3F4",
  },
  subtitle: {
    fontSize: 25,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#98F5F9",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  label: { fontSize: 25, color: "#030303" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 25,
    backgroundColor: "#FAFAFA",
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "white", fontSize: 25, fontWeight: "600" },
  error: { color: "#DC2626", marginTop: 4 },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  resultTitle: { fontSize: 25, fontWeight: "700", color: "#111827" },
  resultLine: { fontSize: 20, color: "#111827" },
  bold: { fontWeight: "700" },
  obs: { fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 8 },
});
