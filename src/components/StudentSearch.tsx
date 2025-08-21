import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, User, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: number;
  name: string;
  parents: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    type: string;
  }[];
  selectedParent?: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    type: string;
  } | null;
}

interface StudentSearchProps {
  selectedStudents: Student[];
  onStudentSelect: (student: Student) => void;
  onStudentRemove: (studentId: number) => void;
  onParentSelect: (studentId: number, parent: { name: string; cpf: string; email: string; phone: string; type: string }) => void;
}

export const StudentSearch = ({ selectedStudents, onStudentSelect, onStudentRemove, onParentSelect }: StudentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchStudents = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .ilike('Nome do Aluno', `%${term}%`)
        .limit(10);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível buscar os alunos.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        setSearchResults([]);
        return;
      }

      const filteredResults = (data as any[])?.filter((student: any) => 
        !selectedStudents.some(selected => selected.id === student["Cod Aluno"])
      ) || [];

      // Mapear os dados do banco para nossa interface Student
      const mappedResults: Student[] = filteredResults.map((item: any) => ({
        id: item["Cod Aluno"],
        name: item["Nome do Aluno"],
        parents: [
          {
            name: item["Nome do Pai"] || "Não informado",
            cpf: item["CPF do Pai"] || "",
            email: item["Email do Pai"] || "",
            phone: item["Telefone do Pai"] || "",
            type: "Pai"
          },
          {
            name: item["Nome da mãe"] || "Não informado", 
            cpf: item["CPF da mãe"] || "",
            email: item["Email da Mãe"] || "",
            phone: item["Telefone da Mãe"] || "",
            type: "Mãe"
          }
        ].filter(parent => parent.name !== "Não informado"),
        selectedParent: null
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro na busca",
        description: "Erro inesperado ao buscar alunos.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchStudents(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedStudents]);

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar aluno pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        
        {searchResults.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-0">
              {searchResults.map((student) => (
                <button
                 key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="w-full p-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {student.parents[0]?.name || 'Não informado'} • Tel: {student.parents[0]?.phone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedStudents.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Alunos Selecionados ({selectedStudents.length}):</p>
          <div className="space-y-3">
            {selectedStudents.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{student.name}</span>
                  </div>
                  <button
                    onClick={() => onStudentRemove(student.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {!student.selectedParent ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span>Selecione o responsável:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {student.parents.map((parent) => (
                        <button
                          key={parent.type}
                          onClick={() => onParentSelect(student.id, parent)}
                          className="p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                          disabled={!parent.name || parent.name === "Não informado"}
                        >
                          <div className="text-sm font-medium mb-1">
                            {parent.type === 'Pai' ? '👨 Pai' : '👩 Mãe'}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Nome: {parent.name}</div>
                            <div>CPF: {parent.cpf || 'Não informado'}</div>
                            <div>Tel: {parent.phone || 'Não informado'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Responsável selecionado: {student.selectedParent.type === 'Pai' ? '👨 Pai' : '👩 Mãe'}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Nome: {student.selectedParent.name}</div>
                      <div>CPF: {student.selectedParent.cpf}</div>
                      <div>Tel: {student.selectedParent.phone}</div>
                    </div>
                    <button
                      onClick={() => {
                        const otherParent = student.parents.find(p => p.type !== student.selectedParent?.type);
                        if (otherParent) onParentSelect(student.id, otherParent);
                      }}
                      className="text-xs text-primary hover:underline mt-2"
                    >
                      Trocar para {student.selectedParent.type === 'Pai' ? 'Mãe' : 'Pai'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};