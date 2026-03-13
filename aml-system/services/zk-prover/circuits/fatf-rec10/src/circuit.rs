use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    pasta::Fp,
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Instance},
    poly::Rotation,
};

#[derive(Clone, Debug)]
pub struct Rec10Config {
    pub advice: Column<Advice>,
    pub instance: Column<Instance>,
}

#[derive(Default, Clone, Debug)]
pub struct Rec10Circuit {
    pub check_executed: Value<Fp>,
}

impl Circuit<Fp> for Rec10Circuit {
    type Config = Rec10Config;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            check_executed: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        let advice = meta.advice_column();
        let instance = meta.instance_column();

        meta.enable_equality(advice);
        meta.enable_equality(instance);

        meta.create_gate("rec10 check equals public instance", |meta| {
            let a = meta.query_advice(advice, Rotation::cur());
            let i = meta.query_instance(instance, Rotation::cur());
            vec![a - i]
        });

        Rec10Config { advice, instance }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "rec10 region",
            |mut region| {
                region.assign_advice(
                    || "rec10 check_executed",
                    config.advice,
                    0,
                    || self.check_executed,
                )?;
                Ok(())
            },
        )?;

        Ok(())
    }
}